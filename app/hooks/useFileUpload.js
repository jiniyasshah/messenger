import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export function useFileUpload(channel, username, setMessages) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file) => {
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

  return { uploadFile, uploadProgress };
}
