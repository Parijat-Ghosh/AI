import React from "react";

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gradient-to-r from-cyan-600 to-pink-600 text-white px-6 py-3 rounded-lg text-sm font-medium">
        <div className="flex items-center space-x-2">
          <span>AI is thinking</span>
          <div className="inline-flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
            <div
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
