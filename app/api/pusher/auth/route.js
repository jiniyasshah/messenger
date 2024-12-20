import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

let activeUsers = new Map();

// Cleanup inactive users every 30 seconds
const CLEANUP_INTERVAL = 30000;
const INACTIVE_THRESHOLD = 60000; // 1 minute

setInterval(() => {
  const now = Date.now();
  for (const [username, data] of activeUsers.entries()) {
    if (now - new Date(data.timestamp).getTime() > INACTIVE_THRESHOLD) {
      activeUsers.delete(username);
      pusher.trigger("presence", "user-status-change", {
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
}, CLEANUP_INTERVAL);

export async function POST(req) {
  const { username, status } = await req.json();
  const timestamp = new Date().toISOString();

  if (status === "online") {
    activeUsers.set(username, { timestamp });
  } else if (status === "offline") {
    activeUsers.delete(username);
  }

  await pusher.trigger("presence", "user-status-change", {
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
