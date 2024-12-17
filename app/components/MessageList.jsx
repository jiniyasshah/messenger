import React, { useRef, useEffect } from "react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import Link from "next/link";

export function MessageList({ messages, username, onImageClick }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-2 px-2 py-3">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex flex-col message ${
            msg.username === username ? "items-end" : "items-start"
          }`}
        >
          <div className="flex flex-col items-end">
            {msg.type === "text" && (
              <div
                className={`flex flex-col ${
                  msg.username === username ? "items-end" : "items-start"
                }`}
              >
                <div className="flex flex-row items-center justify-between gap-x-2 bg-gray-700 p-2 rounded-lg max-w-xs">
                  <div className="break-all">{msg.content}</div>

                  {msg.username === username && (
                    <div>
                      {msg.status === "sent" ? (
                        <IoMdCheckmarkCircle />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked />
                      ) : (
                        <RxCrossCircled />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {msg.username} - {msg.timestamp}
                </p>
              </div>
            )}
            {msg.type === "image" && (
              <div className="relative">
                <img
                  src={msg.content}
                  alt="Uploaded Image"
                  className="rounded-lg max-w-[18rem] cursor-pointer"
                  onClick={() => onImageClick(msg.content)}
                />
                <div className="flex flex-row items-center gap-x-2 text-[0.75rem] absolute bottom-1 right-1 bg-slate-600 border-xl px-2 py-[0.15rem] rounded-xl opacity-70">
                  {msg.timestamp}{" "}
                  {msg.username === username && (
                    <div>
                      {msg.status === "sent" ? (
                        <IoMdCheckmarkCircle size="1.15em" />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked size="1.15em" />
                      ) : (
                        <RxCrossCircled size="1.15em" />
                      )}
                    </div>
                  )}
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
                  {msg.username === username && (
                    <div>
                      {msg.status === "sent" ? (
                        <IoMdCheckmarkCircle size="1.15em" />
                      ) : msg.status === "sending" ? (
                        <MdOutlineRadioButtonUnchecked size="1.15em" />
                      ) : (
                        <RxCrossCircled size="1.15em" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}
