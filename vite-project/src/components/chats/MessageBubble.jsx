import React from "react";
import { useAuth } from "../../hooks/useAuth";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  const isOwnMessage =
    Number(message.senderId) === Number(user?.id);

  console.log({
    message,
    senderId: message.senderId,
    currentUserId: user?.id,
    isOwnMessage,
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[65%] px-4 py-3 rounded-2xl ${
          isOwnMessage
            ? "bg-violet-600 text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md shadow-sm"
        }`}
      >
        <p className="text-sm break-words">
          {message.content}
        </p>

        <p
          className={`text-[11px] mt-1 ${
            isOwnMessage
              ? "text-violet-200"
              : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;