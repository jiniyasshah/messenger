import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

const activeUsersMap = new Map();

// Cleanup inactive users every 30 seconds
const CLEANUP_INTERVAL = 30000;
const INACTIVE_THRESHOLD = 60000; // 1 minute

setInterval(() => {
  const now = Date.now();
  for (const [channelName, activeUsers] of activeUsersMap.entries()) {
    for (const [username, data] of activeUsers.entries()) {
      if (now - new Date(data.timestamp).getTime() > INACTIVE_THRESHOLD) {
        activeUsers.delete(username);

        // Trigger user-status-change for the specific channel
        pusher.trigger(channelName, "user-status-change", {
          username,
          status: "offline",
          timestamp: new Date().toISOString(),
          activeUsers: Array.from(activeUsers.entries()).map(
            ([username, data]) => ({
              username,
              ...data,
            })
          ),
        });
      }
    }
    if (activeUsers.size === 0) {
      activeUsersMap.delete(channelName); // Clean up empty channel entries
    }
  }
}, CLEANUP_INTERVAL);

export async function POST(req) {
  const { username, status, channelName } = await req.json();
  if (!channelName) {
    return NextResponse.json(
      { error: "Channel name is required." },
      { status: 400 }
    );
  }
  const timestamp = new Date().toISOString();

  // Get or initialize the active users for the channel
  if (!activeUsersMap.has(channelName)) {
    activeUsersMap.set(channelName, new Map());
  }
  const activeUsers = activeUsersMap.get(channelName);

  if (status === "online") {
    activeUsers.set(username, { timestamp });
  } else if (status === "offline") {
    activeUsers.delete(username);
  }

  // Trigger user-status-change for the specific channel
  await pusher.trigger(channelName, "user-status-change", {
    username,
    status,
    timestamp,
    activeUsers: Array.from(activeUsers.entries()).map(([username, data]) => ({
      username,
      ...data,
    })),
  });

  return NextResponse.json({ success: true });
}
