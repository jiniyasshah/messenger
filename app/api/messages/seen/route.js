import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});
const uri = process.env.DATABASE_URL;
let client;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("realtime_chat").collection("messages");
}

// Helper function for error responses
function errorResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { messageId, messageSeen } = body;

    // Validate inputs
    if (!messageId || typeof messageSeen !== "boolean") {
      return errorResponse("Message ID and valid messageSeen are required.");
    }

    const messagesCollection = await connectToDB();

    // Use findOneAndUpdate for atomic operation
    const updateResult = await messagesCollection.findOneAndUpdate(
      { id: messageId, messageSeen: { $ne: true } }, // Only update if not already seen
      { $set: { messageSeen: true } },
      { returnDocument: "after" }
    );

    // If no document was found or updated
    if (!updateResult) {
      // Check if message exists at all
      const messageExists = await messagesCollection.findOne({ id: messageId });
      if (!messageExists) {
        return errorResponse("Message not found.", 404);
      }
      // Message exists but was already seen
      return NextResponse.json({ success: true, messageSeen: true });
    }

    // Trigger Pusher event with consistent channel name
    await pusher.trigger("message-updates", "message-seen", {
      messageId,
      messageSeen: true,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      messageSeen: true,
    });
  } catch (error) {
    console.error("Error updating message seen status:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
