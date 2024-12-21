import { useRef, useState, useEffect } from "react";
import {
  MdOutlinePlayCircle,
  MdOutlinePauseCircleFilled,
} from "react-icons/md";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
const VideoPlayer = ({
  msg,
  handleVideoLoad,
  handleVideoPlay,
  setCurrentVideo,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateCurrentTime = () => setCurrentTime(video.currentTime);
      video.addEventListener("timeupdate", updateCurrentTime);
      return () => video.removeEventListener("timeupdate", updateCurrentTime);
    }
  }, []);
  const handleVolumeToggle = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlay = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const newTime = (e.target.value / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    setDuration(video.duration);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleVPlay = (e, content) => {
    setIsPlaying(true);
    handleVideoPlay(e.target, content);
  };

  return (
    <div className="video-player rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900 ">
      {/* Video element */}
      <div className="relative">
        <video
          src={msg.content}
          className="w-full  rounded-t-lg"
          onLoadedData={handleVideoLoad}
          onPlay={(e) => handleVPlay(e, msg.content)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          ref={videoRef}
        />
        <div className="absolute top-1 right-2 text-[0.6rem] opacity-50">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex flex-row w-full justify-between items-center absolute bottom-1 whitespace-nowrap  text-[0.7rem] opacity-80 px-1">
          {" "}
          <div className="video-controls  flex flex-row items-center  gap-x-2">
            {/* Play/Pause button */}
            <div className="flex flex-row items-center gap-x-2 text-[1.35rem]">
              {isPlaying ? (
                <button onClick={handlePause}>
                  <MdOutlinePauseCircleFilled />
                </button>
              ) : (
                <button onClick={handlePlay}>
                  <MdOutlinePlayCircle />
                </button>
              )}
            </div>

            {/* Video progress slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-[0.2rem] bg-gray-300 transition duration-200 ease-in-out rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: `linear-gradient(
      to right,
      #3b82f6 ${(currentTime / duration) * 100 || 0}%,
     #b5b3b3 ${(currentTime / duration) * 100 || 0}%
    )`,
              }}
            />
          </div>
          <button
            onClick={handleVolumeToggle}
            className="transition duration-200 ease-in-out text-xl self-start"
          >
            {isMuted ? <MdVolumeOff /> : <MdVolumeUp />}
          </button>
        </div>
      </div>
      {/* Custom controls */}
    </div>
  );
};

export default VideoPlayer;
