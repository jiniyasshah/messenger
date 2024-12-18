import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { MdArrowBack } from "react-icons/md";
import MessageInput from "../components/MessageInput";
import { useSendMessage } from "../hooks/useMessages";
import { MdOutlineEmojiEmotions } from "react-icons/md";
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

  const {
    messages,
    fetchMessages,
    input,
    setInput,
    sendMessage,
    sendFile,
    addReaction,
  } = useSendMessage(username, channel);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
      fetchMessages();
    } else {
      setShowUsernamePrompt(true);
    }
  }, [channel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking on message or emoji
      if (e.target.closest(".message") || e.target.closest(".emoji-panel")) {
        return;
      }
      setClickedMessageId(null);
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update message click handler

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

  // Function to handle regular click on the message
  const handleMessageContentClick = (e, msgId) => {
    e.stopPropagation();
    setClickedMessageId((prev) => (prev != msgId ? msgId : null));
  };

  const handleEmojiClick = async (messageId, emoji) => {
    try {
      // Call the addReaction method from your hook
      setClickedMessageId(null);
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  // Add handler for emoji clicks

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
      <div className="flex-1 overflow-y-auto space-y-2 px-2 py-3 select-none">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`relative flex flex-col ${
              msg.username === username ? "items-end" : "items-start"
            }`}
          >
            {clickedMessageId === msg.id && (
              <div
                className={`flex flex-col self-center text-[1.7rem] text-gray-400 z-50 bg-transparent mb-4`}
              >
                <div className="flex  flex-row gap-x-[0.6rem] bg-[#23292f] rounded-lg p-2 emoji-panel">
                  <div
                    onClick={() => handleEmojiClick(msg.id, "❤️")}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    ❤️
                  </div>
                  <div
                    onClick={() => handleEmojiClick(msg.id, "😆")}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    😆
                  </div>
                  <div
                    onClick={() => handleEmojiClick(msg.id, "😮")}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    😮
                  </div>
                  <div
                    onClick={() => handleEmojiClick(msg.id, "😢")}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    😢
                  </div>
                  <div
                    onClick={() => handleEmojiClick(msg.id, "😡")}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    😡
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-end  relative">
              {msg.type === "text" && (
                <div
                  className={`flex flex-col ${
                    msg.username === username ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    onMouseDown={(e) => handleMessageContentClick(e, msg.id)} // Regular click
                    className="message flex flex-row items-center md:max-w-xs max-w-[15rem] justify-between gap-x-3 bg-gray-700 p-2 rounded-lg "
                  >
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
                    <div className="flex flex-row self-end text-xs items-center gap-x-1 opacity-70">
                      <div className="text-xs whitespace-nowrap">
                        {msg.timestamp}
                      </div>
                      {msg.username === username &&
                        (msg.status === "sent" ? (
                          <div className="text-sm">
                            <IoMdCheckmarkCircle />
                          </div>
                        ) : msg.status === "sending" ? (
                          <div className="text-sm">
                            <MdOutlineRadioButtonUnchecked />
                          </div>
                        ) : (
                          <div className="text-sm">
                            <RxCrossCircled />
                          </div>
                        ))}
                    </div>
                  </div>
                  {msg.reactions &&
                    Object.entries(msg.reactions).map(
                      ([user, emoji], index) => (
                        <div
                          key={index}
                          className={`self-end bg-gray-800 px-2 py-[0.2rem] rounded-lg bg-opacity-80 -translate-y-2 cursor-pointer text-xs hover:scale-110 transition-transform flex items-center`}
                        >
                          <span>{emoji}</span>
                        </div>
                      )
                    )}
                </div>
              )}
              {msg.type === "image" && (
                <div className="relative rounded-lg max-w-[12rem]  overflow-hidden cursor-pointer">
                  <img
                    src={msg.content}
                    alt="Uploaded Image"
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedImage(msg.content)} // Set selected image for modal
                    onLoad={handleImageLoad}
                  />
                  {!msg.imageCaption && (
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
                  )}
                  {msg.imageCaption && (
                    <div className="flex w-full  flex-row text-sm items-center justify-between gap-x-2 bg-gray-700 p-2 ">
                      {msg.imageCaption.includes("http") ? (
                        <Link
                          href={msg.imageCaption}
                          target="_blank"
                          className="text-blue-400 underline  break-words"
                        >
                          {msg.imageCaption}
                        </Link>
                      ) : (
                        <div className="whitespace-pre-wrap break-words w-full">
                          {msg.imageCaption}
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
                  )}
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

                  {!msg.imageCaption && (
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
                  )}

                  {msg.imageCaption && (
                    <div className="flex w-full  flex-row text-sm items-center justify-between gap-x-2 bg-gray-700 p-2 ">
                      {msg.imageCaption.includes("http") ? (
                        <Link
                          href={msg.imageCaption}
                          target="_blank"
                          className="text-blue-400 underline  break-words"
                        >
                          {msg.imageCaption}
                        </Link>
                      ) : (
                        <div className="whitespace-pre-wrap break-words w-full">
                          {msg.imageCaption}
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
                  )}
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
              className="absolute top-1 left-1   rounded-lg
              bg-gray-800 bg-opacity-70 text-sm px-3 py-2 flex flex-row gap-2 items-center "
              onClick={() => setSelectedImage(null)}
            >
              <MdArrowBack /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
