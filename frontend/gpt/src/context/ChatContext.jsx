import React, { createContext, useState, useEffect,useRef } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [creating, setCreating] = useState(false);

  const creatingRef = useRef(false);
  const [showHistory, setShowHistory] = useState(false); 
  // useEffect(() => {
  //   if (currentChatId || creatingRef.current) return;
  //   creatingRef.current = true;
  //   createNewChat();
  // }, []);

  useEffect(() => {
  const savedChatId = localStorage.getItem("currentChatId");
  if (savedChatId) {
    setCurrentChatId(savedChatId);
    return;
  }
  // Only create a new chat if none exist
  if (!currentChatId && !creatingRef.current) {
    creatingRef.current = true;
    createNewChat();
  }
}, []);

useEffect(() => {
  if (currentChatId) {
    localStorage.setItem("currentChatId", currentChatId);
  }
}, [currentChatId]);


  // Function to create a new chat
  const createNewChat = async () => {
    if (creating) return null; // Already creating
    setCreating(true);
    try {
      const response = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: "You are a helpful assistant." }), // Customize if needed
      });
      const data = await response.json();
      const newChat = data.chat;
      setCurrentChatId(newChat._id); // Set as current to open it
      setCreating(false);
      return newChat._id;
    } catch (error) {
      setCreating(false);
      console.error("Error creating chat:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{ currentChatId, setCurrentChatId, createNewChat, showHistory, setShowHistory }}>
      {children}
    </ChatContext.Provider>
  );
};
