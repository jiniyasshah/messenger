import React from "react";
import { AiOutlineClose } from "react-icons/ai";

export function ImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative">
        <img src={image} alt="Selected" className="max-h-[90vh] max-w-[90vw]" />
        <button
          className="absolute top-2 right-2 text-white text-2xl"
          onClick={onClose}
        >
          <AiOutlineClose />
        </button>
      </div>
    </div>
  );
}
