import React, { useRef, useEffect, useState } from "react";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { MdSend } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
const MessageInput = ({ input, setInput, sendMessage, sendFile }) => {
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // State to track the device type
  const [isMobile, setIsMobile] = useState(false);

  // State to temporarily hold the selected/pasted file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
    setIsMobile(isMobileDevice);
  }, []);

  // Auto-resize textarea based on input
  useEffect(() => {
    const textarea = textAreaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  // Handle input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle pasted images
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const imageURL = URL.createObjectURL(file);
            setSelectedFile(file); // Store the file temporarily
            setPreviewImage(imageURL); // Set image preview
          }
        }
      }
    }
  };

  // Handle uploaded files (via file input)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setSelectedFile(file); // Store the file temporarily
      setPreviewImage(imageURL); // Set image preview
    }
  };

  // Handle submit button or Enter key
  const handleSubmit = (e) => {
    e.preventDefault();

    // Send the selected file if it exists
    if (selectedFile) {
      sendFile(selectedFile);
      setSelectedFile(null); // Clear the file
      setPreviewImage(null); // Clear preview
    }

    // Send the message text if it exists
    if (input.trim() !== "") {
      sendMessage(e);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e); // Trigger submit
    }
  };

  return (
    <div className="p-4 bg-gray-900 relative">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Preview Image Above Textarea */}
        {previewImage && (
          <div className="relative mb-2 self-start">
            <img
              src={previewImage}
              alt="Preview"
              className="w-20 h-20 rounded-md object-cover border border-gray-500"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewImage(null);
              }}
              className="absolute -top-2 -right-2 opacity-80 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
            >
              <RxCross2 />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* File Upload Button */}
          <div
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-transparent rounded-lg hover:text-blue-500 cursor-pointer"
          >
            <MdPhotoSizeSelectActual size="2em" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          {/* Textarea Input */}
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={isMobile ? null : handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none resize-none"
            style={{
              maxHeight: "calc(5 * 1.5em)",
              overflowY: input.split("\n").length > 4 ? "auto" : "hidden",
            }}
          />
          {/* Send Button */}
          <button type="submit" className="text-blue-400 hover:text-blue-500">
            <MdSend size="1.7em" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
