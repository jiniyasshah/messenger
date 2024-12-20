import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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

    // Retrieve the current message
    const currentMessage = await messagesCollection.findOne({ id: messageId });
    if (!currentMessage) {
      return errorResponse("Message not found.", 404);
    }

    const currentStatus = currentMessage.messageSeen || false;

    // Return early if the message is already seen
    if (currentStatus === true) {
      return NextResponse.json({ success: true, messageSeen: true });
    }

    // Update the message as seen
    const updateResult = await messagesCollection.updateOne(
      { id: messageId },
      { $set: { messageSeen: true } }
    );

    if (!updateResult.matchedCount) {
      return errorResponse("Failed to update message seen status.", 500);
    }

    // Notify others via Pusher if required
    // Example: await pusher.trigger("channel", "message-seen", { messageId });

    return NextResponse.json({
      success: true,
      messageSeen: true,
    });
  } catch (error) {
    console.error("Error updating message seen status:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
