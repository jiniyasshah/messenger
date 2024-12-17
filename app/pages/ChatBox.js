import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { MdSend } from "react-icons/md";
import MessageInput from "../components/MessageInput";
import { useSendMessage } from "../hooks/useMessages";
import ReactPlayer from "react-player";
export default function ChatBox() {
  const params = useParams();
  const channel = params.channel;

  const [username, setUsername] = useState("");
  const [clickedMessageId, setClickedMessageId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null); // State for selected video
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  const chatEndRef = useRef(null);
  const { messages, fetchMessages, input, setInput, sendMessage, sendFile } =
    useSendMessage(username, channel);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
      fetchMessages();
    } else {
      setShowUsernamePrompt(true);
    }
  }, [channel]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      localStorage.setItem("username", tempUsername);
      setUsername(tempUsername);
      setShowUsernamePrompt(false);
      fetchMessages();
    }
  };
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleVideoPlay = (videoRef, videoSrc) => {
    // Pause other videos
    if (currentVideo && currentVideo !== videoRef) {
      currentVideo.pause();
    }

    // Update the current video
    setCurrentVideo(videoRef);
  };

  const [imageLoaded, setImageLoaded] = useState(true);
  const handleImageLoad = () => setImageLoaded(true);

  const [videoLoaded, setVideoLoaded] = useState(true);
  const handleVideoLoad = () => setVideoLoaded(true);

  useEffect(() => {
    if (imageLoaded || !messages.some((msg) => msg.type === "image")) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, imageLoaded, videoLoaded]);

  return (
    <div className="flex flex-col h-screen bg-black text-white relative">
      {/* Username Prompt Overlay */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex items-center justify-center h-screen">
            <div
              // onSubmit={handleSubmit}
              className="bg-gray-800 p-6 rounded-lg shadow-lg w-80"
            >
              <h1 className="text-2xl font-bold mb-4 text-center">
                Join {channel}
              </h1>
              <div className="flex flex-col gap-4">
                {/* Name Input */}
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                />
                {/* Channel Name Input */}

                {/* Submit Button */}
                <button
                  type="submit"
                  onClick={handleUsernameSubmit}
                  className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white font-semibold"
                >
                  Enter Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
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
                <div
                  className={`flex flex-col ${
                    msg.username === username ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex flex-row items-center  justify-between gap-x-2 bg-gray-700 p-2 rounded-lg max-w-xs">
                    {msg.content.includes("http") ? (
                      <Link
                        href={msg.content}
                        target="_blank"
                        className="text-blue-400 underline  break-words"
                      >
                        {msg.content}
                      </Link>
                    ) : (
                      <div className="whitespace-pre-wrap break-words max-w-[15rem]">
                        {msg.content}
                      </div>
                    )}

                    {msg.username === username &&
                      (msg.status === "sent" ? (
                        <div>
                          <IoMdCheckmarkCircle />
                        </div>
                      ) : msg.status === "sending" ? (
                        <div>
                          <MdOutlineRadioButtonUnchecked />
                        </div>
                      ) : (
                        <div>
                          <RxCrossCircled />
                        </div>
                      ))}
                  </div>
                  {clickedMessageId === msg.id && ( // Conditionally render based on clicked message ID
                    <p className="text-sm text-gray-400">
                      {msg.username} - {msg.timestamp}
                    </p>
                  )}
                </div>
              )}
              {msg.type === "image" && (
                <div className="relative rounded-lg max-w-[12rem] max-h-[20rem] overflow-hidden cursor-pointer">
                  <img
                    src={msg.content}
                    alt="Uploaded Image"
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedImage(msg.content)} // Set selected image for modal
                    onLoad={handleImageLoad}
                  />
                  <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute bottom-1 right-1 bg-slate-600 border-xl px-2 py-[0.15rem] rounded-xl opacity-70">
                    {msg.timestamp}
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
                <div className=" relative rounded-lg max-w-[12rem] max-h-[25rem] overflow-hidden cursor-pointer">
                  <video
                    controls
                    src={msg.content}
                    className="w-full min-h-[20rem]"
                    onClick={() => setSelectedVideo(msg.content)}
                    onLoadedData={handleVideoLoad}
                    onPlay={(e) => handleVideoPlay(e.target, msg.content)}
                  />

                  <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute top-2 right-2 bg-slate-600 border-xl px-2 py-[0.15rem] rounded-xl opacity-70">
                    {msg.timestamp}
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
      <MessageInput
        sendMessage={sendMessage}
        sendFile={sendFile}
        input={input}
        setInput={setInput}
      />

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
              className="absolute top-1 right-1 text-white  rounded-lg
              bg-gray-800 px-3 py-2 opacity-90 text-xs"
              onClick={() => setSelectedImage(null)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
