import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const POST = async (req) => {
  try {
    console.log("API Route Hit: Processing File Upload...");

    // Get file from request
    const data = await req.formData();
    const image = data.get("image");

    if (!image) {
      console.error("No image file provided in the request.");
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }
    console.log("Image Received:", image.name, image.type);

    // Convert image to base64
    const fileBuffer = await image.arrayBuffer();
    console.log("File Buffer Length:", fileBuffer.byteLength);

    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = `data:${image.type};base64,${base64Data}`;
    console.log("Base64 Data Created.");

    // Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(fileUri, {
      invalidate: true,
    });
    console.log("Upload Successful:", result.secure_url);

    // Return success response
    return NextResponse.json(
      { success: true, imageUrl: result.secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in File Upload Process:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
