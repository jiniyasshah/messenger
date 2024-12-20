// hooks/usePusher.js
import { useState, useEffect, useRef } from "react";
import PusherClient from "pusher-js";

let pusherInstance = null;

export const usePusher = (currentUsername, channelName) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [latestActiveUser, setLatestActiveUser] = useState(null);
  const channelRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    if (!currentUsername || !channelName) return;

    // Initialize Pusher only once
    if (!pusherInstance) {
      pusherInstance = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        }
      );
    }

    // Function to update user status
    const updateUserStatus = async (status) => {
      try {
        await fetch("/api/pusher/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUsername,
            status,
            channelName,
          }),
          keepalive: true,
        });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    };

    // Subscribe to channel
    if (!channelRef.current) {
      channelRef.current = pusherInstance.subscribe(channelName);
    }

    // Set up event handler
    const handleUserStatusChange = (data) => {
      setActiveUsers(data.activeUsers);
      if (data.status === "online" && data.username !== currentUsername) {
        setLatestActiveUser({
          username: data.username,
          timestamp: data.timestamp,
        });
      }
    };

    // Listen for Pusher connection state changes
    pusherInstance.connection.bind("state_change", ({ current }) => {
      if (current === "connected") {
        updateUserStatus("online");
      } else if (current === "disconnected") {
        updateUserStatus("offline");
      }
    });

    // Set up heartbeat to keep user active
    heartbeatIntervalRef.current = setInterval(() => {
      updateUserStatus("online");
    }, 30000); // Send heartbeat every 30 seconds

    // Handle page unload
    const handleBeforeUnload = () => {
      updateUserStatus("offline");
    };

    // Handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserStatus("offline");
      } else {
        updateUserStatus("online");
      }
    };

    // Set up event listeners
    channelRef.current.bind("user-status-change", handleUserStatusChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial status update
    updateUserStatus("online");

    // Cleanup function
    return () => {
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Remove event listeners
      if (channelRef.current) {
        channelRef.current.unbind("user-status-change", handleUserStatusChange);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Set user as offline
      updateUserStatus("offline");
    };
  }, [currentUsername, channelName]);

  return { activeUsers, latestActiveUser };
};
