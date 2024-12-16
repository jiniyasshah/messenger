"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation"; // Correct use of params
import Pusher from "pusher-js";
import axios from "axios";
import Link from "next/link";

export default function ChatBox() {
  const params = useParams(); // Use the Next.js hook
  const channel = params.channel; // Extract the channel name safely

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch previous messages when the component loads
  useEffect(() => {
    const storedName = localStorage.getItem("username") || "Guest";
    setUsername(storedName);

    // Fetch messages for the specific channel
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/messages?channel=${channel}`);
        console.log(response.data);
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channelInstance = pusher.subscribe(channel);
    channelInstance.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(channel);
    };
  }, [channel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      username,
      content: input,
      type: "text",
      timestamp: new Date().toLocaleTimeString(),
    };

    await axios.post("/api/messages", { channel, message: newMessage });
    setInput("");
  };

  const sendFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME
    );

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      formData
    );

    const newMessage = {
      username,
      content: response.data.secure_url,
      type: file.type.startsWith("video") ? "video" : "image",
      timestamp: new Date().toLocaleTimeString(),
    };

    await axios.post("/api/messages", { channel, message: newMessage });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-center text-lg font-semibold">
        Channel: {channel}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.username === username ? "items-end" : "items-start"
            }`}
          >
            <p className="text-sm text-gray-400">
              {msg.username} - {msg.timestamp}
            </p>
            {msg.type === "text" && (
              <p className="bg-gray-700 p-2 rounded-lg max-w-xs">
                {msg.content.includes("http") ? (
                  <Link
                    href={msg.content}
                    target="_blank"
                    className="text-blue-400 underline"
                  >
                    {msg.content}
                  </Link>
                ) : (
                  msg.content
                )}
              </p>
            )}
            {msg.type === "image" && (
              <img
                src={msg.content}
                alt="Uploaded Image"
                className="rounded-lg max-w-xs"
              />
            )}
            {msg.type === "video" && (
              <video
                controls
                src={msg.content}
                className="rounded-lg max-w-xs"
              ></video>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 flex items-center bg-gray-900 gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500"
        ></button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => sendFile(e.target.files[0])}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
        />
        <button
          type="submit"
          className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
