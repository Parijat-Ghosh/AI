// routes/chatRoutes.js
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
const { uploadLocalFile, deleteByPublicId } = require("../lib/cloudinary");

const router = express.Router();

// --- Multer: accept only PNG/JPEG, max 2 files, 10MB each ---
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(png|jpe?g)/i.test(file.mimetype);
    cb(ok ? null : new Error("Only PNG and JPEG allowed"), ok);
  },
});

// --- NVIDIA client (via OpenAI-compatible SDK) ---
const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

console.log("[routes/chatRoutes] loaded");

// ----------------------------------------------
// Helpers
// ----------------------------------------------

function cleanTitle(raw) {
  if (!raw) return null;
  let t = String(raw).trim();
  t = t.replace(/^["'“”‘’]|["'“”‘’]$/g, "");
  t = t.replace(/\s+/g, " ");
  t = t.slice(0, 80).trim(); // keep reasonable length
  return t.length >= 2 ? t : null;
}

async function generateChatTitleFromText(text) {
  const base = (text || "").trim().slice(0, 300);
  if (!base) return null;
  const resp = await client.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
    messages: [
      { role: "system", content: "Create a super short, 3-5 word chat title. No punctuation. No quotes." },
      { role: "user", content: `Title for: ${base}` },
    ],
    max_tokens: 20,
  });
  const raw = resp.choices?.[0]?.message?.content || "";
  return cleanTitle(raw);
}

// Convert DB messages -> NVIDIA-compatible messages
function buildNvidiaMessages(chatDoc, opts = {}) {
  const maxMessages = typeof opts.maxMessages === "number" ? opts.maxMessages : 100;
  const arr = [];

  if (chatDoc.systemPrompt) {
    arr.push({ role: "system", content: chatDoc.systemPrompt });
  }

  const allMsgs = chatDoc.messages || [];
  const start = Math.max(0, allMsgs.length - maxMessages);
  const relevant = allMsgs.slice(start);

  // Find the last user message that has images
  let lastUserWithImagesIndex = -1;
  for (let i = relevant.length - 1; i >= 0; i--) {
    const m = relevant[i];
    if (m.role === "user" && Array.isArray(m.images) && m.images.length > 0) {
      lastUserWithImagesIndex = i;
      break;
    }
  }

  for (let i = 0; i < relevant.length; i++) {
    const m = relevant[i];
    if (m.role === "user") {
      const content = [];
      if (m.text && String(m.text).trim() !== "") {
        content.push({ type: "text", text: m.text });
      }
      // Only include images for the most recent user-with-images message
      if (i === lastUserWithImagesIndex) {
        for (const img of m.images || []) {
          if (img && img.url) {
            content.push({ type: "image_url", image_url: { url: img.url } });
          }
        }
      }
      arr.push({ role: "user", content: content.length ? content : [{ type: "text", text: "" }] });
    } else if (m.role === "assistant") {
      arr.push({ role: "assistant", content: m.text || "" });
    } else if (m.role === "system") {
      // Allow any stray system messages that may exist
      arr.push({ role: "system", content: m.text || "" });
    } else {
      arr.push({ role: m.role, content: m.text || "" });
    }
  }

  return arr;
}

// ----------------------------------------------
// Routes
// ----------------------------------------------

// Create new chat
router.post("/", async (req, res) => {
  try {
    const { systemPrompt } = req.body || {};
    const chat = await Chat.create({ systemPrompt, title: "New Chat" });
    return res.json({ chatId: chat._id.toString(), chat });
  } catch (e) {
    console.error("Create chat error:", e?.message || e);
    return res.status(500).json({ error: "Failed to create chat" });
  }
});

// List all chats (titles for sidebar)
router.get("/", async (req, res) => {
  const chats = await Chat.find({}, "title updatedAt lastMessageAt").sort({ updatedAt: -1 }).lean();
  return res.json({ chats });
});

// Get one chat with messages
router.get("/:chatId", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  return res.json({ chat });
});

// Rename a chat
router.patch("/:chatId", async (req, res) => {
  const { title } = req.body;
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, { title }, { new: true });
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  return res.json({ chat });
});

// Send text-only message
router.post("/:chatId/messages", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "text required" });

  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  try {
    // 1) Save user message
    chat.messages.push({ role: "user", text });
    chat.lastMessageAt = new Date();

    // 2) Title generation on first user turn (before assistant reply)
    const userTurns = chat.messages.filter(m => m.role === "user").length;
    if (chat.title === "New Chat" && userTurns === 1) {
      try {
        const t = await generateChatTitleFromText(text);
        if (t) chat.title = t;
      } catch (e) {
        console.warn("Title generation failed:", e?.message || e);
      }
    }

    // 3) Build history and call model
    const messages = buildNvidiaMessages(chat, { maxMessages: 60 });
    const completion = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
      messages,
      max_tokens: 512,
    });
    const reply = completion.choices?.[0]?.message?.content || "";

    // 4) Save assistant reply and persist
    chat.messages.push({ role: "assistant", text: reply });
    chat.lastMessageAt = new Date();
    await chat.save();

    return res.json({ reply, chat });
  } catch (err) {
    console.error("Text message error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: "Failed to process message" });
  }
});

// Send text+images
router.post("/:chatId/messages-with-images", upload.array("images", 2), async (req, res) => {
  const { text } = req.body;
  const files = req.files || [];
  console.log(`[${new Date().toISOString()}] POST /api/chats/${req.params.chatId}/messages-with-images - files=${files.length}`);

  // Enforce image limit in case Multer is bypassed
  if (files.length > 2) {
    for (const f of files) { try { fs.unlinkSync(f.path); } catch {} }
    return res.status(400).json({
      error: "max_images_exceeded",
      details: "You can upload up to 2 images per message.",
    });
  }

  // Find chat
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    for (const f of files) { try { fs.unlinkSync(f.path); } catch {} }
    console.warn("Chat not found:", req.params.chatId);
    return res.status(404).json({ error: "chat_not_found" });
  }

  // 1) Upload images to Cloudinary
  let uploaded = [];
  try {
    for (const f of files) {
      console.log("Uploading file ->", { path: f.path, originalname: f.originalname, mimetype: f.mimetype, size: f.size });
      const u = await uploadLocalFile(f.path, "chat-uploads", { width: 512, height: 512 });
      console.log("Cloudinary upload OK:", { url: u.url, publicId: u.publicId, width: u.width, height: u.height });
      uploaded.push({
        url: u.url,
        publicId: u.publicId,
        width: u.width,
        height: u.height,
        mimeType: f.mimetype,
      });
    }
  } catch (cloudErr) {
    for (const f of files) { try { fs.unlinkSync(f.path); } catch {} }
    console.error("Cloudinary upload failed:", cloudErr);
    return res.status(502).json({
      error: "cloudinary_upload_failed",
      details: cloudErr?.message || cloudErr,
    });
  } finally {
    // remove temp files
    for (const f of files) { try { fs.unlinkSync(f.path); } catch {} }
  }

  // 2) Save user message with images
  try {
    chat.messages.push({ role: "user", text: text || "", images: uploaded });
    chat.lastMessageAt = new Date();

    // 3) Title generation on first user turn (before assistant reply)
    const userTurns = chat.messages.filter(m => m.role === "user").length;
    if (chat.title === "New Chat" && userTurns === 1) {
      try {
        const t = await generateChatTitleFromText(text || "");
        if (t) chat.title = t;
      } catch (e) {
        console.warn("Title generation failed (images route):", e?.message || e);
      }
    }

    // 4) Call the model
    const messages = buildNvidiaMessages(chat);
    console.log("➡️ Payload to NVIDIA (first 2 items shown):", JSON.stringify(messages.slice(0, 2), null, 2));

    let reply = "";
    try {
      const completion = await client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
        messages,
        max_tokens: 512,
      });
      reply = completion.choices?.[0]?.message?.content || "";
      console.log("NVIDIA reply length:", (reply || "").length);
    } catch (modelErr) {
      console.error("Model call failed:", modelErr?.response?.data || modelErr?.message || modelErr);
      // Persist a placeholder so images remain in DB for debugging
      chat.messages.push({ role: "assistant", text: "[model call failed]" });
      await chat.save().catch(() => {});
      return res.status(502).json({
        error: "model_call_failed",
        details: modelErr?.response?.data || modelErr?.message || String(modelErr),
      });
    }

    // 5) Save assistant reply and persist
    chat.messages.push({ role: "assistant", text: reply });
    chat.lastMessageAt = new Date();
    await chat.save();

    // 6) Return success
    return res.json({ reply, chat });
  } catch (err) {
    console.error("Unexpected error in messages-with-images:", err?.stack || err);
    return res.status(500).json({
      error: "internal_server_error",
      details: err?.message || String(err),
    });
  }
});

// Delete chat (cleanup Cloudinary images too)
router.delete("/:chatId", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const publicIds = chat.messages.flatMap(m => (m.images || []).map(i => i.publicId));
  await Promise.all(publicIds.map(id => deleteByPublicId(id).catch(() => {})));
  await chat.deleteOne();
  return res.json({ ok: true });
});

module.exports = router;

