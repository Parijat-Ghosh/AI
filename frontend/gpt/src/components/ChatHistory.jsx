
import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { X, Trash2 } from "lucide-react";

function truncate(str, max = 28) {
  return str.length <= max ? str : str.slice(0, max) + "...";
}

export default function ChatHistory() {
  const { setCurrentChatId, setShowHistory } = useContext(ChatContext);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/chats")
      .then((res) => res.json())
      .then((data) => {
        setChats(
          (data.chats || []).sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )
        );
      });
  }, []);

  function handleSelect(id) {
    setCurrentChatId(id);
    localStorage.setItem("currentChatId", id);
    setShowHistory(false);
  }

  function handleClose() {
    setShowHistory(false);
  }

  // --- Handle chat deletion
  async function handleDelete(id) {
    if (!window.confirm("Delete this chat permanently?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setChats((prev) => prev.filter((chat) => chat._id !== id)); // Remove from state
      } else {
        alert("Failed to delete chat.");
      }
    } catch (err) {
      alert("Error deleting chat");
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900/40 to-black">
      {/* Header with close button */}
      <div className="flex items-center p-4 border-b border-white/20 shadow-sm bg-black/30 backdrop-blur-xl">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="text-gray-300 hover:text-gray-900 focus:outline-none">
          <X size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-white">Chat History</h1>
      </div>
      {/* Scrollable chat list */}
      <div className="flex-1 overflow-auto p-4">
        {chats.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            No chat history found.
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat._id}
            className="flex items-center mb-2 rounded-lg bg-gray-900 hover:bg-gray-800 overflow-hidden"
          >
            {/* Clickable chat title */}
            <button
              onClick={() => handleSelect(chat._id)}
              className="flex-1 text-left p-4 text-white  focus:outline-none"
              title={chat.title}
              style={{ background: "transparent" }}
            >
              {truncate(chat.title)}
            </button>
            {/* Red delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Don't select chat
                handleDelete(chat._id);
              }}
              aria-label="Delete chat"
              className="p-2 text-white bg-red-500 hover:bg-red-600 flex items-center justify-center"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
