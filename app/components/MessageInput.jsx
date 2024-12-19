import React, { useRef, useEffect, useState } from "react";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { MdSend } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
const MessageInput = ({
  input,
  setInput,
  sendMessage,
  sendFile,
  setHandleMessageSend,
}) => {
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // State to track the device type
  const [isMobile, setIsMobile] = useState(false);

  // State to temporarily hold the selected/pasted file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewFileIcon, setPreviewFileIcon] = useState(null);

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
      if (file.type.startsWith("image/")) {
        const imageURL = URL.createObjectURL(file);
        setPreviewImage(imageURL); // Set image preview
      } else if (file.type.startsWith("video/")) {
        const videoURL = URL.createObjectURL(file);
        setPreviewVideo(videoURL); // Set video preview
      } else {
        setPreviewFileIcon(true); // Set file icon preview
      }
      setSelectedFile(file); // Store the file temporarily
    }
  };
  // Handle submit button or Enter key
  const handleSubmit = (e) => {
    e.preventDefault();
    setHandleMessageSend(true);
    const hasFile = selectedFile !== null;
    const hasText = input.trim() !== "";

    if (hasFile) {
      sendFile(selectedFile, hasText ? input : null); // Send file with text only if text exists
      setSelectedFile(null);
      setPreviewImage(null);
      setPreviewVideo(null);
      setPreviewFileIcon(null);
    }

    if (hasText && !hasFile) {
      sendMessage(e); // Send message only if no file was sent
    }

    // Clear the input field after sending the message
    setInput("");
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
        {previewVideo && (
          <div className="relative mb-2 self-start">
            <video
              src={previewVideo}
              className="w-20 h-20 rounded-md object-cover border border-gray-500"
              // This makes the first frame of the video appear as a thumbnail
              controls={false} // Remove controls
            />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewVideo(null);
              }}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500"
            >
              <RxCross2 />
            </button>
          </div>
        )}
        {previewFileIcon && (
          <div className="relative mb-2 self-start">
            <div className="w-20 h-20 rounded-md border border-gray-500 flex items-center justify-center bg-gray-700">
              <MdPhotoSizeSelectActual size="2em" />
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewFileIcon(null);
              }}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500"
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
            className="bg-transparent rounded-lg text-blue-400 hover:text-blue-500 cursor-pointer"
          >
            <MdPhotoSizeSelectActual size="2em" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="*/*"
            onChange={handleFileUpload}
          />
          {/* Textarea Input */}
          {!previewImage ? (
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
          ) : (
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={isMobile ? null : handleKeyDown}
              onPaste={handlePaste}
              placeholder="Add a caption..."
              rows={1}
              className="flex-1 w-full p-2 rounded-lg bg-gray-700 text-white focus:outline-none resize-none"
              style={{
                maxHeight: "calc(5 * 1.5em)",
                overflowY: input.split("\n").length > 4 ? "auto" : "hidden",
              }}
            />
          )}
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
