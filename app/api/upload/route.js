import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  const data = await req.formData();
  const file = await data.get("file"); // Expect "file" for both images/videos
  const fileBuffer = await file.arrayBuffer();

  const mime = file.type; // Get MIME type (image/jpeg, video/mp4, etc.)
  const encoding = "base64";
  const base64Data = Buffer.from(fileBuffer).toString("base64");
  const fileUri = `data:${mime};${encoding},${base64Data}`; // Construct data URI

  try {
    // Dynamically set resource type for images and videos
    const resourceType = mime.startsWith("image/")
      ? "image"
      : mime.startsWith("video/")
      ? "video"
      : "raw"; // Default to "raw" for other file types

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload(fileUri, {
            invalidate: true,
            resource_type: resourceType, // Set resource type dynamically
          })
          .then((result) => {
            console.log(result);
            resolve(result);
          })
          .catch((error) => {
            console.error("Upload Error:", error);
            reject(error);
          });
      });
    };

    const result = await uploadToCloudinary();

    const fileUrl = result.secure_url;

    return NextResponse.json(
      { success: true, fileUrl: fileUrl, resourceType: resourceType },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
