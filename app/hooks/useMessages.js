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
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        status: "sending",
        reactions: {}, // Add reactions object
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
    async (file, imageCaption) => {
      if (!file) return;

      const filePreviewUrl = URL.createObjectURL(file);

      // Determine file type
      const fileType = file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("image")
        ? "image"
        : "file"; // Generic file type for others

      const newMessage = {
        id: uuidv4(),
        username,
        content: filePreviewUrl, // Local preview for the file
        type: fileType,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        imageCaption: imageCaption || "",
        status: "sending",
      };

      setMessages((prev) => [...prev, newMessage]);

      const formData = new FormData();
      formData.append("file", file); // Use 'file' as the form data key

      try {
        // Upload file to the server
        const { data } = await axios.post("/api/upload", formData);

        if (data.success) {
          const uploadedMessage = {
            ...newMessage,
            content: data.fileUrl, // Replace preview with actual file URL
            status: "sent",
          };

          // Update message locally with uploaded file URL
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? uploadedMessage : msg
            )
          );

          // Send final message to the backend
          await axios.post("/api/messages", {
            channel,
            message: uploadedMessage,
          });
        } else {
          throw new Error(data.error || "File upload failed");
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

  const addReaction = async (messageId, emoji) => {
    // Optimistically update the UI
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const updatedReactions = { ...msg.reactions };
          if (updatedReactions[username] === emoji) {
            // If the same emoji exists, remove it
            delete updatedReactions[username];
          } else {
            // Otherwise, add/update the reaction
            updatedReactions[username] = emoji;
          }
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      })
    );

    try {
      // Send the API request
      const { data } = await axios.patch("/api/messages", {
        messageId,
        emoji: emoji, // Send the emoji to add or remove
        username, // Ensure this is passed
      });

      // Update state with confirmed reactions from the server
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    } catch (error) {
      console.error("Error in addReaction:", error.message || error);

      // Revert the optimistic update if the API call fails
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const updatedReactions = { ...msg.reactions };
            if (updatedReactions[username] === emoji) {
              // Re-add the removed reaction on failure
              updatedReactions[username] = emoji;
            } else {
              // Remove the optimistic reaction if it was added
              delete updatedReactions[username];
            }
            return { ...msg, reactions: updatedReactions };
          }
          return msg;
        })
      );
    }
  };

  return {
    messages,
    setInput,
    input,
    sendMessage,
    sendFile,
    fetchMessages,
    addReaction,
  };
};
