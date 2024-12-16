"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation"; // Correct use of params
import Pusher from "pusher-js";
import axios from "axios";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique IDs
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai"; // Import close icon
import { MdSend } from "react-icons/md";

export default function ChatBox() {
  const params = useParams(); // Use the Next.js hook
  const channel = params.channel; // Extract the channel name safely

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [clickedMessageId, setClickedMessageId] = useState(null); // State to track clicked message
  const [selectedImage, setSelectedImage] = useState(null); // State to track selected image for modal
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
          // Set status to 'sent' for messages fetched from the database
          const messagesWithStatus = response.data.messages.map((msg) => ({
            ...msg,
            status: "sent",
          }));
          setMessages(messagesWithStatus);
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
      setMessages((prev) => {
        // Check if the message already exists
        if (!prev.some((msg) => msg.id === data.id)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    return () => {
      pusher.unsubscribe(channel);
    };
  }, [channel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add event listener to detect clicks outside the messages
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".message")) {
        setClickedMessageId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: uuidv4(), // Generate a unique ID for each message
      username,
      content: input,
      type: "text",
      timestamp: new Date().toLocaleTimeString(),
      status: "sending", // Initial status
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    try {
      await axios.post("/api/messages", { channel, message: newMessage });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
      console.error("Error sending message:", error);
    }
  };

  const sendFile = async (file) => {
    if (!file) return;

    // Create a new message with "sending" status
    const newMessage = {
      id: uuidv4(),
      username,
      content: URL.createObjectURL(file), // Show file preview immediately
      type: file.type.startsWith("video") ? "video" : "image",
      timestamp: new Date().toLocaleTimeString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMessage]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Upload the image via API
      const response = await axios.post("/api/upload", formData);

      if (response.data.success) {
        const uploadedMessage = {
          ...newMessage,
          content: response.data.imageUrl, // Update with the uploaded URL
          status: "sent", // Update status to "sent"
        };

        // Update the message in the state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === newMessage.id ? uploadedMessage : msg))
        );

        // Optionally send the message to the server/channel
        await axios.post("/api/messages", {
          channel,
          message: uploadedMessage,
        });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("File upload failed:", error.message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-center text-lg font-semibold">
        Channel: {channel}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-2 py-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col message ${
              msg.username === username ? "items-end" : "items-start"
            }`}
            onClick={() =>
              setClickedMessageId((prev) => (prev === msg.id ? null : msg.id))
            } // Toggle clicked message ID
          >
            <div className="flex flex-col items-end  ">
              {msg.type === "text" && (
                <div>
                  <p className="flex flex-row items-center justify-between gap-x-2 bg-gray-700 p-2 rounded-lg max-w-xs">
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
                    {msg.username === username &&
                      (msg.status === "sent" ? (
                        <IoMdCheckmarkCircle />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked />
                      ) : (
                        <RxCrossCircled />
                      ))}
                  </p>
                  {clickedMessageId === msg.id && ( // Conditionally render based on clicked message ID
                    <p className="text-sm text-gray-400">
                      {msg.username} - {msg.timestamp}
                    </p>
                  )}
                </div>
              )}
              {msg.type === "image" && (
                <div className="relative">
                  <img
                    src={msg.content}
                    alt="Uploaded Image"
                    className="rounded-lg max-w-[18rem] cursor-pointer"
                    onClick={() => setSelectedImage(msg.content)} // Set selected image for modal
                  />
                  <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute bottom-1 right-1 bg-slate-600 border-xl px-2 py-[0.15rem] rounded-xl opacity-70">
                    {msg.timestamp}{" "}
                    {msg.username === username &&
                      (msg.status === "sent" ? (
                        <IoMdCheckmarkCircle size="1.15em" />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked size="1.15em" />
                      ) : (
                        <RxCrossCircled size="1.15em" />
                      ))}
                  </div>
                </div>
              )}
              {msg.type === "video" && (
                <div className="relative">
                  <video
                    controls
                    src={msg.content}
                    className="rounded-lg max-w-xs"
                  ></video>
                  <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute top-2 right-2 bg-slate-600 border-xl px-2 py-[0.15rem] rounded-xl opacity-70">
                    {msg.timestamp}{" "}
                    {msg.username === username &&
                      (msg.status === "sent" ? (
                        <IoMdCheckmarkCircle size="1.15em" />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked size="1.15em" />
                      ) : (
                        <RxCrossCircled size="1.15em" />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
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
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
        />
        <button type="submit">
          <MdSend size="1.7em" />
        </button>
      </form>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-h-[90vh] max-w-[90vw]"
            />
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              <AiOutlineClose />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
