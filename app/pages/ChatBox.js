import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import ReactionComponent from "../components/ReactionComponent";
import { MdArrowBack } from "react-icons/md";
import MessageInput from "../components/MessageInput";
import { useSendMessage } from "../hooks/useMessages";
import VideoPlayer from "../components/VideoPlayer";
import { usePusher } from "../hooks/usePusher";
export default function ChatBox() {
  const params = useParams();
  const channel = params.channel;

  const [username, setUsername] = useState("");
  const [clickedMessageId, setClickedMessageId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  // State for selected video
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const { activeUsers } = usePusher(username);
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

  const generateGradient = (name) => {
    // Simple gradient generation based on name (or initials)
    const charCodeSum = name.charCodeAt(0) + name.charCodeAt(name.length - 1); // Simple method of hashing
    const gradientIndex = charCodeSum % 5; // Limit gradients to 5 possibilities

    const gradients = [
      "from-emerald-400 to-cyan-400", // Sky to Cyan
      "from-red-500 to-orange-500", // Pink to Purple
      "from-fuchsia-500 to-pink-500", // Green to Blue
      "from-lime-400 to-lime-500", // Yellow to Red
      "from-emerald-400 to-cyan-400", // Indigo to Purple
    ];

    return gradients[gradientIndex];
  };

  const [imageLoaded, setImageLoaded] = useState(false);
  const handleImageLoad = () => setImageLoaded(true);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const handleVideoLoad = () => setVideoLoaded(true);

  const [handleMessageSend, setHandleMessageSend] = useState(false);
  // useEffect(() => {
  //   if (imageLoaded || !messages.some((msg) => msg.type === "image")) {
  //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages, imageLoaded, videoLoaded, clickedMessageId]);
  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (
      messages.length > prevMessagesLength.current ||
      handleMessageSend ||
      imageLoaded ||
      videoLoaded
    ) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHandleMessageSend(false);
      setImageLoaded(false);
      setVideoLoaded(false);
    }
    prevMessagesLength.current = messages.length;
  }, [messages, imageLoaded, videoLoaded, handleMessageSend]);

  const messageRefs = useRef({});
  // Function to handle regular click on the message
  const handleMessageContentClick = (e, msgId, msgType) => {
    console.log(msgId);
    if (msgType === "text") {
      messageRefs.current[msgId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      messageRefs.current[msgId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    e.stopPropagation();
    setClickedMessageId((prev) => (prev != msgId ? msgId : null));
  };

  const handleEmojiClick = async (messageId, emoji) => {
    try {
      setClickedMessageId(null);
      // Optimistically update the emojiData

      // Call the addReaction method to persist the change
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error("Error adding reaction:", error);

      // Revert the optimistic update if the API call fails
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
      {
        <div
          className={`flex-1 overflow-y-auto ${
            !selectedImage ? "visible" : "invisible"
          }px-2 py-3 select-none`}
        >
          {messages.map((msg, index) => {
            const isFirstMessage = index === 0;
            const isSameUserAsPrevious =
              !isFirstMessage && messages[index - 1].username === msg.username;
            const isLastMessageFromUser =
              index === messages.length - 1 ||
              messages[index + 1].username !== msg.username;
            const isUserActive = msg.activeUsers?.some(
              (user) => user.username === username
            );

            // Check for conditions: either more than one user or exactly one user
            const shouldDisplayContent =
              (isUserActive && msg.activeUsers?.length > 1) ||
              msg.activeUsers?.length === 1;

            return (
              <div
                key={index}
                ref={(el) => (messageRefs.current[msg.id] = el)}
                className={`${
                  shouldDisplayContent ? "" : "hidden"
                } relative flex flex-col ${
                  msg.username === username ? "items-end" : "items-start"
                }`}
              >
                {clickedMessageId === msg.id && (
                  <div
                    className={`flex flex-col ${
                      msg.username === username
                        ? "md:self-end md:-translate-x-[10rem]"
                        : "md:self-start md:translate-x-[10rem]"
                    } self-center  text-gray-400 z-50 bg-transparent mb-4`}
                  >
                    <div className="flex  flex-row gap-x-[0.3rem] bg-[#23292f] rounded-full px-2 py-1 emoji-panel">
                      {["❤️", "😆", "😮", "😢", "😡"].map((emoji) => (
                        <div
                          key={emoji}
                          onClick={() => handleEmojiClick(msg.id, emoji)}
                          className={`${
                            msg.reactions && msg.reactions[username] === emoji
                              ? "selected bg-gray-600 "
                              : ""
                          } hover:-translate-y-1 cursor-pointer text-[1.4rem] transition-all rounded-xl duration-200 px-1`}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                )}{" "}
                <div
                  className={`${
                    (isLastMessageFromUser && !isSameUserAsPrevious) ||
                    (!isFirstMessage &&
                      isLastMessageFromUser &&
                      !clickedMessageId) ||
                    msg.id === clickedMessageId
                      ? "mb-4"
                      : "mb-[0.3rem]"
                  } flex flex-row px-2 items-center gap-x-2 transition-all duration-200 ease-in-out`}
                >
                  {msg.username !== username && (
                    <div
                      className={`${
                        (isLastMessageFromUser && !isSameUserAsPrevious) ||
                        (!isFirstMessage && isLastMessageFromUser) ||
                        msg.id === clickedMessageId
                          ? "visible"
                          : "invisible"
                      } text-xs self-end opa text-white bg-gradient-to-r ${generateGradient(
                        msg.username
                      )} rounded-full w-[1.15rem] h-[1.15rem] flex items-center justify-center`}
                    >
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col items-end  relative">
                    {msg.type === "text" && (
                      <div
                        className={`flex message flex-col bg-gray-700 p-2 rounded-xl ${
                          msg.username === username
                            ? "items-end"
                            : "items-start"
                        }`}
                        onMouseDown={(e) =>
                          handleMessageContentClick(e, msg.id, msg.type)
                        } // Regular click
                      >
                        <div className=" flex flex-row  space-y-1 items-center md:max-w-xs max-w-[17rem]  justify-between gap-x-2  rounded-xl ">
                          {msg.content.includes("http") ? (
                            <div>
                              <Link
                                href={msg.content}
                                target="_blank"
                                className="text-blue-400 underline  break-all"
                              >
                                {" "}
                                {msg.content}
                              </Link>
                              <ReactionComponent
                                msg={msg}
                                username={username}
                              />
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words md:max-w-xs   max-w-[14rem]">
                              {msg.content}{" "}
                              <ReactionComponent
                                msg={msg}
                                username={username}
                              />
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
                      </div>
                    )}

                    {msg.type === "image" && (
                      <div className="relative message bg-gradient-to-r from-violet-600 to-indigo-600  rounded-lg max-w-[12rem]  overflow-hidden cursor-pointer">
                        <div className=" max-h-[15rem] overflow-hidden relative">
                          <img
                            src={msg.content}
                            alt="Uploaded Image"
                            className="w-full h-full object-cover rounded-lg bg-gradient-to-r  "
                            // Set selected image for modal
                            onLoad={handleImageLoad}
                            onClick={() => setSelectedImage(msg.content)}
                          />
                        </div>

                        <div
                          onMouseDown={(e) =>
                            handleMessageContentClick(e, msg.id, msg.type)
                          }
                          className={`flex  flex-wrap ${
                            msg.imageCaption ? "justify-between" : "justify-end"
                          } items-center px-[0.5rem] py-[0.16rem] space-y-1 gap-x-1`}
                        >
                          {msg.imageCaption && (
                            <div className="flex flex-row text-sm items-center justify-between gap-x-2     rounded-b-lg">
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
                            </div>
                          )}
                          <ReactionComponent msg={msg} username={username} />
                          {!(
                            Object.values(msg?.reactions || {}).length > 0
                          ) && (
                            <div className="flex  flex-row text-lg  gap-x-1 opacity-70">
                              {/* <IoMdOpen  /> */}
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
                          )}
                        </div>

                        {/* {!msg.imageCaption && (
                    <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute top-2 left-2 bg-gray-600 border-xl px-2 py-[0.15rem] rounded-xl bg-opacity-90">
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
                  )} */}
                        {/* {msg.imageCaption && (
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
                  )} */}
                      </div>
                    )}

                    {msg.type === "video" && (
                      <div className=" relative bg-gradient-to-r from-blue-800 to-indigo-900 rounded-lg max-w-[12rem] max-h-[25rem] overflow-hidden cursor-pointer">
                        <VideoPlayer
                          msg={msg}
                          handleVideoLoad={handleVideoLoad}
                          handleVideoPlay={handleVideoPlay}
                        />

                        <div
                          onMouseDown={(e) =>
                            handleMessageContentClick(e, msg.id, msg.type)
                          }
                          className={`flex  flex-wrap ${
                            msg.imageCaption ? "justify-between" : "justify-end"
                          } items-center px-[0.5rem] py-[0.16rem] space-y-1 gap-x-1`}
                        >
                          {msg.imageCaption && (
                            <div className="flex flex-row text-sm items-center justify-between gap-x-2     rounded-b-lg mt-1">
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
                            </div>
                          )}
                          <ReactionComponent msg={msg} username={username} />
                          {!(
                            Object.values(msg?.reactions || {}).length > 0
                          ) && (
                            <div className="flex  flex-row text-lg  gap-x-1 opacity-70">
                              {/* <IoMdOpen  /> */}
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
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.username === username && (
                    <div
                      className={`${
                        (isLastMessageFromUser && !isSameUserAsPrevious) ||
                        (!isFirstMessage && isLastMessageFromUser) ||
                        msg.id === clickedMessageId
                          ? "visible"
                          : "invisible"
                      } text-xs self-end opa text-white bg-gradient-to-r ${generateGradient(
                        msg.username
                      )} rounded-full w-[1.15rem] h-[1.15rem] flex items-center justify-center`}
                    >
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      }

      {/* Input */}
      {!selectedImage && (
        <MessageInput
          sendMessage={sendMessage}
          sendFile={sendFile}
          input={input}
          setInput={setInput}
          setHandleMessageSend={setHandleMessageSend}
          activeUsers={activeUsers}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center z-50">
          <div className="relative ">
            <button
              className="self-start rounded-lg
              bg-gray-700 bg-opacity-70 text-sm px-3 py-2 flex flex-row gap-2 items-center "
              onClick={() => setSelectedImage(null)}
            >
              <MdArrowBack />
            </button>
            <img
              src={selectedImage}
              alt="Selected"
              className="max-h-[90vh] max-w-[90vw] mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
