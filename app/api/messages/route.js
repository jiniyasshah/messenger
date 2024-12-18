import { NextResponse } from "next/server";
import Pusher from "pusher";
import { MongoClient } from "mongodb";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// MongoDB Connection
const uri = process.env.DATABASE_URL;
let client;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("realtime_chat").collection("messages");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { channel, message } = body;

    if (!channel || !message) {
      return NextResponse.json(
        { error: "Channel and message are required." },
        { status: 400 }
      );
    }

    const messagesCollection = await connectToDB();

    // Save the message to MongoDB
    await messagesCollection.insertOne({
      channel,
      ...message,
      createdAt: new Date(),
    });

    // Trigger Pusher event to broadcast the message
    await pusher.trigger(channel, "new-message", message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error saving or broadcasting message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const channel = url.searchParams.get("channel");
    console.log("fetching messages:");
    if (!channel) {
      return NextResponse.json(
        { error: "Channel is required." },
        { status: 400 }
      );
    }

    const messagesCollection = await connectToDB();

    // Retrieve messages for the specific channel
    const messages = await messagesCollection
      .find({ channel })
      .sort({ createdAt: 1 }) // Sort messages by creation time (ascending)
      .toArray();

    // Return the messages as JSON response
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { messageId, emoji, username } = body;

    if (!messageId || !emoji || !username) {
      return NextResponse.json(
        { error: "Message ID, emoji, and username are required." },
        { status: 400 }
      );
    }

    const messagesCollection = await connectToDB();

    // Update the reactions in the database
    const updateResult = await messagesCollection.updateOne(
      { id: messageId },
      {
        $set: {
          [`reactions.${username}`]: emoji, // Ensure one emoji per user
        },
      }
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json(
        { error: "Message not found." },
        { status: 404 }
      );
    }

    const updatedMessage = await messagesCollection.findOne({ id: messageId });

    // Notify others via Pusher
    await pusher.trigger("reactions", "updated", {
      messageId,
      reactions: updatedMessage.reactions,
    });

    return NextResponse.json({
      success: true,
      reactions: updatedMessage.reactions,
    });
  } catch (error) {
    console.error("Error updating reactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
