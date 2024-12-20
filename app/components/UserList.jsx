import { useState, useEffect } from "react";

export default function UserStatusNotification({ activeUsers }) {
  const [notification, setNotification] = useState(null);
  const [prevUsersList, setPrevUsersList] = useState([]);

  useEffect(() => {
    // Find added and removed users by comparing current and previous lists
    const addedUsers = activeUsers.filter(
      (user) =>
        !prevUsersList.find((prevUser) => prevUser.username === user.username)
    );

    const removedUsers = prevUsersList.filter(
      (user) =>
        !activeUsers.find(
          (currentUser) => currentUser.username === user.username
        )
    );

    // Create notification message if there are changes
    if (addedUsers.length > 0) {
      setNotification({
        type: "joined",
        users: addedUsers,
        timestamp: new Date(),
      });
    } else if (removedUsers.length > 0) {
      setNotification({
        type: "left",
        users: removedUsers,
        timestamp: new Date(),
      });
    }

    // Clear notification after 3 seconds
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    // Update previous users list
    setPrevUsersList(activeUsers);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, [activeUsers]);

  if (!notification) return null;

  return (
    <div
      className={`
      fixed top-4 right-4 p-4 rounded-lg shadow-lg
      transition-opacity duration-300 ease-in-out
      ${notification.type === "joined" ? "bg-green-100" : "bg-orange-100"}
    `}
    >
      <div className="flex items-center gap-2">
        {notification.type === "joined" ? (
          <div className="text-green-700">
            {notification.users.length === 1 ? (
              <span>{notification.users[0].username} joined</span>
            ) : (
              <span>{notification.users.length} users joined</span>
            )}
          </div>
        ) : (
          <div className="text-orange-700">
            {notification.users.length === 1 ? (
              <span>{notification.users[0].username} left</span>
            ) : (
              <span>{notification.users.length} users left</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
