import React, { useState } from "react";
import usePusher from "../hooks/usePusher";
export function UsernamePrompt({ channel, onSubmit }) {
  const [tempUsername, setTempUsername] = useState("");
  const { initializePusher } = usePusher(channel);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      initializePusher(tempUsername);
      onSubmit(tempUsername);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Join {channel}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white font-semibold"
          >
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
}
