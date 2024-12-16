"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && channel.trim()) {
      // Save the name to localStorage for access in the chat page
      localStorage.setItem("username", name);
      router.push(`/channel/${channel}`);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Join a Channel</h1>
        <div className="flex flex-col gap-4">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          {/* Channel Name Input */}
          <input
            type="text"
            placeholder="Enter channel name"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white font-semibold"
          >
            Enter Chat
          </button>
        </div>
      </form>
    </div>
  );
}
