import React from "react";
import { Wand2, Plus, History, Home, LogOut } from "lucide-react";
import { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const { createNewChat, creating, setShowHistory } = useContext(ChatContext);
  const navigate = useNavigate();

  // const handleCreateChat = async () => {
  //   await createNewChat();
  // };

  const handleCreateChat = async () => {
    const chatId = await createNewChat();
    if (chatId) {
      localStorage.setItem("currentChatId", chatId);
    }
  };

  const handleHomeClick = () => {
    navigate("/page"); // Adjust path '/' to where Page.jsx is routed
  };

  const handleXClick = () => {
    navigate("/pricing");
  };

  return (
    <div className="w-20 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 space-y-8 relative z-10">
      {/* Top Button */}
      <button
        className="group relative p-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-2xl hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
        onClick={handleXClick}>
        <Wand2 className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10" onclick={handleXClick} /> */}
      </button>

      {/* Middle Buttons */}
      <div className="flex flex-col space-y-6 flex-1">
        <button
          className="group relative p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300 border border-white/20"
          onClick={handleCreateChat}>
          <Plus
            disabled={creating}
            className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
            onClick={handleCreateChat}
          />
        </button>

        <button
          className="group relative p-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110"
          onClick={() => setShowHistory(true)}>
          <History className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>

        <button
          className="group relative p-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110"
          onClick={handleHomeClick}>
          <Home className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
        </button>
      </div>

      {/* User Avatar at Bottom */}

      <button
        
        className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden hover:scale-110 transition-transform duration-300"
        >
        <img
          src="/imageLogo.png"
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </button>

      {/* Side Indicator */}
      <div className="absolute right-0 top-1/2 w-1 h-16 bg-gradient-to-b from-cyan-400 to-pink-400 rounded-l-full animate-pulse" />
    </div>
  );
}

export default Sidebar;
