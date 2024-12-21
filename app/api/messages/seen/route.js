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

// Helper function for error responses
const errorResponse = (message, status = 400) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { messageId, username } = body;

    // Input validation
    if (!messageId || typeof messageId !== "string") {
      return errorResponse("Valid messageId is required");
    }

    if (!username || typeof username !== "string") {
      return errorResponse("Valid username is required");
    }

    const messagesCollection = await connectToDB();

    // Atomic update operation
    const updateResult = await messagesCollection.findOneAndUpdate(
      {
        id: messageId,
        messageSeen: { $ne: username }, // Prevent duplicate seen status
      },
      {
        $addToSet: { messageSeenBy: username }, // Add to array of users who've seen
        $set: {
          lastSeenAt: new Date(),
          messageSeen: username, // Maintain backwards compatibility
        },
      },
      {
        returnDocument: "after",
        projection: { messageSeenBy: 1, messageSeen: 1 },
      }
    );

    // Handle case where message doesn't exist or was already seen
    if (!updateResult) {
      const messageExists = await messagesCollection.findOne(
        { id: messageId },
        { projection: { messageSeen: 1 } }
      );

      if (!messageExists) {
        return errorResponse("Message not found", 404);
      }

      return NextResponse.json({
        success: true,
        messageSeen: messageExists.messageSeen,
        messageSeenBy: messageExists.messageSeenBy || [],
      });
    }

    // Broadcast update via Pusher
    const eventData = {
      messageId,
      messageSeen: username,
      messageSeenBy: updateResult.messageSeenBy,
      timestamp: new Date().toISOString(),
    };

    await pusher.trigger("message-updates", "message-seen", eventData);

    return NextResponse.json({
      success: true,
      ...eventData,
    });
  } catch (error) {
    console.error("Error updating message seen status:", error);
    return errorResponse(
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal Server Error",
      500
    );
  }
}
