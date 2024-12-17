import React, { useRef, useEffect, useState } from "react";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { MdSend } from "react-icons/md";

const MessageInput = ({ input, setInput, sendMessage, sendFile }) => {
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // State to track whether it's mobile or desktop
  const [isMobile, setIsMobile] = useState(false);

  // Detect device type based on user agent string
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
    setIsMobile(isMobileDevice);
  }, []);

  useEffect(() => {
    const textarea = textAreaRef.current;
    textarea.style.height = "auto"; // Reset height before calculating
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to the scroll height of the content
  }, [input]);

  // Handle input change and auto-resize
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle key press for Enter and Shift + Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // If Enter is pressed without Shift, send the message
      e.preventDefault(); // Prevent adding a new line
      sendMessage(e);
    } else if (e.key === "Enter" && e.shiftKey) {
      // If Shift + Enter is pressed, insert a new line
      setInput((prevInput) => prevInput);
    }
  };

  return (
    <form
      onSubmit={sendMessage}
      className="p-4 flex items-center bg-gray-900 justify-evenly gap-2"
    >
      <div
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="bg-transparent rounded-lg hover:text-blue-500"
      >
        <MdPhotoSizeSelectActual size="2em" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => sendFile(e.target.files[0])}
      />
      <textarea
        ref={textAreaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={isMobile ? null : handleKeyDown} // Apply handleKeyDown only for non-mobile
        placeholder="Type a message..."
        rows={1}
        className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none resize-none"
        style={{
          maxHeight: "calc(5 * 1.5em)", // Limit the height to 5 rows
          overflowY: input.split("\n").length > 4 ? "auto" : "hidden", // Enable scroll when more than 5 lines
        }}
      />
      <button type="submit">
        <MdSend size="1.7em" />
      </button>
    </form>
  );
};

export default MessageInput;
