import React from "react";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
const ReactionComponent = ({ username, msg }) => {
  // Function to count occurrences of each emoji
  const handleReactionCount = (emoji) => {
    const reactionCounts = Object.values(reactions).reduce(
      (acc, currentEmoji) => {
        acc[currentEmoji] = (acc[currentEmoji] || 0) + 1;
        return acc;
      },
      {}
    );
    return reactionCounts[emoji] || 0;
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

  return (
    <>
      {msg.reactions && Object.values(msg.reactions).length > 0 && (
        <div className="flex flex-wrap space-y-1 gap-x-4 md:mt-2 mt-1 items-center justify-between md:max-w-xs max-w-[10rem]">
          <div
            className={` cursor-pointer  hover:scale-110 transition-transform flex flex-wrap items-center gap-x-1`}
          >
            {Object.entries(
              Object.values(msg.reactions).reduce((acc, emoji) => {
                acc[emoji] = (acc[emoji] || 0) + 1; // Count occurrences of each emoji
                return acc;
              }, {})
            ).map(([emoji, count], index) => (
              <div
                key={index}
                className="flex rounded-lg items-center md:px-[0.4rem] px-[0.3rem]  bg-gray-800 bg-opacity-80 gap-x-1"
              >
                {count > 1 ? (
                  <div className="flex flex-row gap-x-[0.15rem] items-center">
                    {emoji}
                    <div
                      className={`rounded-full text-[0.7rem] text-center text-white flex items-center justify-center`}
                    >{`+${count}`}</div>
                  </div>
                ) : (
                  <>
                    {emoji}
                    <div
                      className={`bg-gradient-to-r ${generateGradient(
                        Object.keys(msg.reactions).find(
                          (user) => msg.reactions[user] === emoji
                        )
                      )} rounded-full text-[0.7rem] text-center text-white w-4 h-4 flex items-center justify-center`}
                    >
                      {Object.keys(msg.reactions)
                        .find((user) => msg.reactions[user] === emoji)
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className=" flex flex-row text-xs items-center gap-x-1 opacity-70">
            <div className="text-xs whitespace-nowrap">{msg.timestamp}</div>
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
      )}
    </>
  );
};

export default ReactionComponent;
