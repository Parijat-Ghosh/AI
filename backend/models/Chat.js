const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  mimeType: String,
  width: Number,
  height: Number,
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["system", "user", "assistant"], required: true },
  text: { type: String, default: "" },
  images: { type: [imageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const chatSchema = new mongoose.Schema({
  title: { type: String, default: "New Chat", maxlength: 80 },
  systemPrompt: { type: String, default: "You are a helpful assistant." },
  messages: { type: [messageSchema], default: [] },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);

