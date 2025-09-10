import React from "react";

function SuggestionCard({ suggestion, isDisabled, handleClick }) {
  const IconComponent = suggestion.icon;

  return (
    <button
      onClick={() => handleClick(suggestion.title)}
      className={`group relative p-8 bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl transition-all duration-500 text-left transform shadow-xl ${
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-white/40 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
      }`}
      disabled={isDisabled}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${suggestion.gradient} opacity-0 transition-opacity duration-500 rounded-3xl ${
          !isDisabled ? "group-hover:opacity-10" : ""
        }`}
      />

      {/* Content */}
      <div className="relative flex items-start space-x-6">
        <div
          className={`p-4 bg-gradient-to-br ${suggestion.gradient} rounded-2xl transition-transform duration-300 shadow-lg ${
            !isDisabled ? "group-hover:scale-110" : ""
          }`}
        >
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p
            className={`text-gray-100 transition-colors duration-300 leading-relaxed text-lg font-medium ${
              !isDisabled ? "group-hover:text-white" : ""
            }`}
          >
            {suggestion.title}
          </p>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${suggestion.gradient} opacity-0 blur-xl transition-opacity duration-500 rounded-3xl -z-10 ${
          !isDisabled ? "group-hover:opacity-20" : ""
        }`}
      />
    </button>
  );
}

export default SuggestionCard;