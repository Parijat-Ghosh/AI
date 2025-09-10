

import React, { useState, useRef } from "react";
import { Send, Paperclip, X, Eye } from "lucide-react";

function ChatInput({ message, setMessage, handleSubmit, isDisabled }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);

    // Filter for valid image types and check total count
    const validFiles = files.filter(
      (file) =>
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg"
    );

    // Only add images if we don't exceed the 2 image limit
    const availableSlots = 2 - selectedImages.length;
    const filesToAdd = validFiles.slice(0, availableSlots);

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (imageId) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      // Clean up URL objects
      const toRemove = prev.find((img) => img.id === imageId);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return updated;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (handleSubmit) {
      handleSubmit(e, selectedImages);
      // Clear images after submit
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
    }
  };

  const openImagePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const hasImages = selectedImages.length > 0;
  const canAddMoreImages = selectedImages.length < 2;

  return (
    <>
      <div className="relative">
        <form onSubmit={handleFormSubmit} className="relative">
          {/* Image Preview Area - shows when images are selected */}
          {hasImages && (
            <div className="mb-3 p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-white/70">
                  {selectedImages.length}/2 images selected
                </span>
              </div>
              <div className="flex gap-2">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-all"
                      onClick={() => openImagePreview(image.preview)}>
                      <img
                        src={image.preview}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                      {/* Eye icon overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div
            className="flex items-end space-x-4 bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mr-15
          transition-all duration-300 ease-in-out
             hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30
             focus-within:border-cyan-400 focus-within:shadow-lg focus-within:shadow-cyan-400/30">
            {/* Image Upload Button */}
            <div className="flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageSelect}
                className="hidden"
                disabled={!canAddMoreImages || isDisabled}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canAddMoreImages || isDisabled}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  canAddMoreImages && !isDisabled
                    ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                    : "text-white/30 cursor-not-allowed"
                }`}>
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isDisabled}
                className="w-full bg-transparent text-white placeholder-white/50 resize-none border-none outline-none min-h-[24px] max-h-32"
                rows={1}
                style={{
                  height: "auto",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
                    e.preventDefault(); // stop adding new line
                    handleFormSubmit(e); // trigger your submit logic
                  }
                }}
              />
            </div>

            {/* Send Button */}
            <div className="flex-shrink-0">
              <button
                type="submit"
                disabled={
                  isDisabled || (!message.trim() && selectedImages.length === 0)
                }
                className={`p-3 rounded-xl transition-all duration-200 ${
                  !isDisabled && (message.trim() || selectedImages.length > 0)
                    ? "bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700 cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Helper text */}
        <div className="text-center mt-3 mb-2">
          <p className="text-white/40 text-sm">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeImagePreview}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImagePreview}
              className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatInput;
