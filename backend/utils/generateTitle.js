// utils/generateTitle.js
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

function cleanTitle(raw) {
  if (!raw) return null;
  let t = String(raw).trim();
  t = t.replace(/^["'“”‘’]|["'“”‘’]$/g, ""); // strip surrounding quotes
  t = t.replace(/\s+/g, " "); // collapse spaces
  t = t.slice(0, 60).trim(); // cap length
  // Avoid empty or too short strings
  return t.length >= 2 ? t : null;
}

async function generateChatTitleFromText(text) {
  const base = (text || "").trim().slice(0, 300);
  if (!base) return null;
  const completion = await client.chat.completions.create({
    model: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
    messages: [
      { role: "system", content: "Create a super short, 3-5 word chat title. No punctuation. No quotes." },
      { role: "user", content: `Title for: ${base}` },
    ],
    max_tokens: 20,
  });
  const raw = completion.choices?.[0]?.message?.content || "";
  return cleanTitle(raw);
}

module.exports = { generateChatTitleFromText, cleanTitle };
