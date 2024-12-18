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
  try {
    const data = await req.formData();
    const file = await data.get("file"); // Expect "file" field for the uploaded file

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const mime = file.type; // MIME type (image/jpeg, video/mp4, etc.)
    const resourceType = mime.startsWith("image/")
      ? "image"
      : mime.startsWith("video/")
      ? "video"
      : "raw"; // Default to "raw" for unsupported types

    const MAX_CHUNK_SIZE = 3 * 1024 * 1024; // 4MB

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        `data:${mime};base64,${Buffer.from(fileBuffer).toString("base64")}`,
        {
          resource_type: resourceType,
          chunk_size: MAX_CHUNK_SIZE,
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
    });

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
