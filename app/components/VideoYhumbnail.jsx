import { useState, useEffect } from "react";

const VideoThumbnailPreview = ({ file }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (!file) return;

    // Create a video element
    const videoElement = document.createElement("video");

    // Create a canvas to capture a frame
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const generateThumbnail = () => {
      videoElement.currentTime = 1; // Seek to 1 second to grab a frame
      videoElement.onloadeddata = () => {
        // Draw the current frame to the canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(); // Convert canvas to image data URL
        setThumbnail(dataUrl); // Set the thumbnail image
      };
    };

    const objectUrl = URL.createObjectURL(file);
    videoElement.src = objectUrl;

    videoElement.onloadedmetadata = () => {
      canvas.width = videoElement.videoWidth / 3; // Adjust width for preview size
      canvas.height = videoElement.videoHeight / 3; // Adjust height for preview size
      generateThumbnail();
    };

    return () => {
      URL.revokeObjectURL(objectUrl); // Clean up URL after use
    };
  }, [file]);

  return (
    <div className="relative mb-2 self-start">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="Video thumbnail"
          className="w-20 h-20 rounded-md object-cover border border-gray-500"
        />
      ) : (
        <div className="w-20 h-20 rounded-md object-cover bg-gray-300 border border-gray-500 flex items-center justify-center">
          <span className="text-gray-700">Loading...</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setThumbnail(null);
        }}
        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500"
      >
        X
      </button>
    </div>
  );
};

export default VideoThumbnailPreview;
