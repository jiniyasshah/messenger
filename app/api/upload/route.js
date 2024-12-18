import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { NextResponse } from "next/server";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  try {
    const data = await req.formData();
    const file = await data.get("file"); // Expect "file" field for the uploaded file

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const mime = file.type; // MIME type (image/jpeg, video/mp4, etc.)

    // Determine resource type based on MIME type
    const resourceType = mime.startsWith("image/")
      ? "image"
      : mime.startsWith("video/")
      ? "video"
      : "raw"; // Default to "raw" for unsupported types

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto", // Dynamically determine resource type
            invalidate: true,
          },
          (error, result) => {
            if (error) {
              console.error("Upload Error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Stream the file to Cloudinary using streamifier
        streamifier
          .createReadStream(Buffer.from(fileBuffer))
          .pipe(uploadStream);
      });
    };

    const result = await uploadToCloudinary();

    return NextResponse.json(
      { success: true, fileUrl: result.secure_url, resourceType: resourceType },
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
