import React from "react";
import Avatar from "../common/Avatar";

const ConversationCard = ({
  conversation,
  active,
  onClick,
}) => {
  const user = conversation?.otherUser;
  const lastMessage = conversation?.lastMessage;
  const unreadCount = conversation?.unreadCount || 0;

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${
        active
          ? "bg-violet-50 text-violet-900 border border-violet-100 shadow-sm"
          : "hover:bg-slate-50 border border-transparent"
      }`}
    >
      {/* Avatar */}
      <Avatar
        src={user?.avatar}
        name={user?.username || "Dev"}
        size="lg"
        showStatus={true}
        isOnline={true}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800 truncate text-sm">
            {user?.username || "Unknown User"}
          </h3>

          <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">
            {formatTime(
              lastMessage?.createdAt ||
              conversation?.updatedAt
            )}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-xs text-slate-500 truncate">
            {lastMessage?.content || "Start a conversation..."}
          </p>

          {/* Unread count */}
          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;