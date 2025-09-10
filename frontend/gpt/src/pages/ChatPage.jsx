import React, { useState, useEffect, useContext, useRef } from "react";
import ChatLayout from "../layouts/ChatLayout";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import SuggestionCard from "../components/SuggestionCard";
import ChatInput from "../components/ChatInput";
import { Zap, List, Mail, FileText, BarChart3 } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import ChatHistory from "../components/ChatHistory";
import Sidebar from "../components/Sidebar";
import { X } from "lucide-react";

function ChatPage() {
  const [username, setUsername] = useState("");
  const { currentChatId, showHistory } = useContext(ChatContext);

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  

  const messagesEndRef = useRef(null);

  // Fetch messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/chats/${currentChatId}`
          );
          const data = await response.json();
          setMessages(data.chat.messages || []);
        } catch (error) {
          console.error("Error fetching chat messages:", error);
          setMessages([]); // Fallback to empty
        }
      };
      fetchMessages();
    } else {
      setMessages([]); // Reset if no chat
    }
  }, [currentChatId]);

  // Background floating particles
  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]); // Scroll when messages change or typing status changes


  useEffect(() => {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    // Truncate to 7 characters if longer
    const truncatedName = loggedInUser.length > 7 
      ? loggedInUser.substring(0, 7) 
      : loggedInUser;
    setUsername(truncatedName);
  }
}, []);

  const suggestions = [
    {
      icon: List,
      title: "Write a to-do list for a personal project or task",
      gradient: "from-cyan-400 via-blue-500 to-purple-600",
    },
    {
      icon: Mail,
      title: "Generate an email to reply to a job offer",
      gradient: "from-pink-400 via-red-500 to-orange-500",
    },
    {
      icon: FileText,
      title: "Summarise this article or text for me in one paragraph",
      gradient: "from-green-400 via-cyan-500 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "How does AI work in a technical capacity",
      gradient: "from-purple-400 via-pink-500 to-red-500",
    },
  ];

  const handleSuggestionClick = (title) => {
    if (isDisabled) return;
    setMessage(title);
  };


  const handleSubmit = async (e, selectedImages = []) => {
    e.preventDefault();

    if (!message.trim() && selectedImages.length === 0) return;
    if (isDisabled || !currentChatId) {
      if (!currentChatId) {
        console.error("No chat selected");
      }
      return;
    }

    const userMessage = {
      role: "user",
      text: message.trim(),
      images: selectedImages.map((img) => ({ preview: img.preview })), // Temporary for UI
      createdAt: new Date(),
    };

    // Add user message immediately to UI
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsDisabled(true);
    setIsTyping(true);

    try {
      let response;

      if (selectedImages.length > 0) {
        // Send with images
        const formData = new FormData();
        formData.append("text", message.trim());

        selectedImages.forEach((image, index) => {
          formData.append("images", image.file);
        });

        response = await fetch(
          `http://localhost:5000/api/chats/${currentChatId}/messages-with-images`,
          {
            method: "POST",
            body: formData,
          }
        );
      } else {
        // Send text only
        response = await fetch(
          `http://localhost:5000/api/chats/${currentChatId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: message.trim() }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remove the temporary user message and add the real ones from server
      setMessages((prev) => {
        const withoutTemp = prev.slice(0, -1); // Remove temporary message
        return [...withoutTemp, ...data.chat.messages.slice(-2)]; // Add last 2 messages (user + assistant)
      });
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove temporary message and add error
      setMessages((prev) => {
        const withoutTemp = prev.slice(0, -1);
        return [
          ...withoutTemp,
          {
            role: "assistant",
            text: "Sorry, I encountered an error. Please try again.",
            createdAt: new Date(),
          },
        ];
      });
    } finally {
      setIsTyping(false);
      setIsDisabled(false);
    }
  };

  function closeHistory() {
    setShowHistory(false);
  }

 if (showHistory) {
    return <ChatHistory />;
  }

  return (
    <ChatLayout>
      {/* Scrollable Content (messages or welcome) */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        {" "}
        {/* Takes available height, scrolls vertically, padding for content */}
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingElements.map((el) => (
            <div
              key={el.id}
              className="absolute animate-float opacity-20"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                animationDelay: `${el.id * 0.5}s`,
                animationDuration: `${3 + el.id * 0.5}s`,
              }}>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full blur-sm animate-pulse" />
            </div>
          ))}

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>
        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble key={msg._id || index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        {/* Welcome screen (when no messages) */}
        <div
          className={`${
            messages.length > 0
              ? "hidden"
              : "flex items-center justify-center min-h-full"
          } transition-all duration-500 ${
            isDisabled ? "opacity-50 pointer-events-none" : ""
          }`}>
          <div className="max-w-5xl w-full space-y-12">
            <div className="text-center space-y-6 animate-fade-in">
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight">
                Hi there,{" "}
                <span className="relative inline-block ml-4">
                  <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient-x">
                    {username || 'User'}
                  </span>
                </span>
              </h1>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-100">
                What would{" "}
                <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                  like to know?
                </span>
              </h2>

              <div className="flex items-center justify-center space-x-3">
                <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                <p className="text-gray-300 text-xl font-medium">
                  Use one of the most common prompts below or use your own to
                  begin
                </p>
                <Zap
                  className="w-6 h-6 text-yellow-400 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {suggestions.map((s, i) => (
                <SuggestionCard
                  key={i}
                  suggestion={s}
                  isDisabled={isDisabled}
                  handleClick={handleSuggestionClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

     
      <div className="sticky bottom-0 border-t border-white/10 bg-black/20 backdrop-blur-xl relative z-10">
        {" "}
        
        {isTyping && <TypingIndicator />}
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          isDisabled={isDisabled}
        />
      </div>
    </ChatLayout>
  );
}

export default ChatPage;
