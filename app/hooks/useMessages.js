import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Pusher from "pusher-js";

export const useSendMessage = (username, channel) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Helper function: Handle API errors
  const handleApiError = (error, context) => {
    console.error(`Error in ${context}:`, error.message || error);
  };

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/messages?channel=${channel}`);
      if (data.success) {
        const messagesWithStatus = data.messages.map((msg) => ({
          ...msg,
          status: "sent",
        }));
        setMessages(messagesWithStatus);
      }
    } catch (error) {
      handleApiError(error, "fetchMessages");
    }
  }, [channel]);

  // Send a text message
  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim()) return;

      const newMessage = {
        id: uuidv4(),
        username,
        content: input,
        type: "text",
        timestamp: new Date().toLocaleTimeString(),
        status: "sending",
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
        handleApiError(error, "sendMessage");
      }
    },
    [input, channel, username]
  );

  // Send a file
  const sendFile = useCallback(
    async (file) => {
      if (!file) return;

      const filePreviewUrl = URL.createObjectURL(file);
      const newMessage = {
        id: uuidv4(),
        username,
        content: filePreviewUrl,
        type: file.type.startsWith("video") ? "video" : "image",
        timestamp: new Date().toLocaleTimeString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, newMessage]);

      const formData = new FormData();
      formData.append("image", file);

      try {
        const { data } = await axios.post("/api/upload", formData);
        if (data.success) {
          const uploadedMessage = {
            ...newMessage,
            content: data.imageUrl, // Replace preview with uploaded URL
            status: "sent",
          };

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? uploadedMessage : msg
            )
          );

          await axios.post("/api/messages", {
            channel,
            message: uploadedMessage,
          });
        } else {
          throw new Error(data.error || "Upload failed");
        }
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
        handleApiError(error, "sendFile");
      } finally {
        URL.revokeObjectURL(filePreviewUrl); // Clean up memory
      }
    },
    [channel, username]
  );

  // Pusher setup for real-time messages
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channelInstance = pusher.subscribe(channel);

    const handleNewMessage = (data) => {
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === data.id)) {
          return [...prev, { ...data, status: "sent" }];
        }
        return prev;
      });
    };

    channelInstance.bind("new-message", handleNewMessage);

    return () => {
      channelInstance.unbind("new-message", handleNewMessage);
      pusher.unsubscribe(channel);
    };
  }, [channel]);

  return {
    messages,
    setInput,
    input,
    sendMessage,
    sendFile,
    fetchMessages,
  };
};
