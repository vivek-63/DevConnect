
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Video, MoreVertical } from "lucide-react";

import { socket } from "../../socket/socket";
import Avatar from "../common/Avatar";

const ChatHeader = ({ user }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setIsOnline(false);
      return;
    }

    const userId = Number(user.id);

    // Update status using the current list of online users.
    const handleOnlineUsers = (onlineUsers) => {
      const isUserOnline = onlineUsers.some(
        (id) => Number(id) === userId
      );

      setIsOnline(isUserOnline);
    };

    // Update status when the user comes online.
    const handleUserOnline = (onlineUserId) => {
      if (Number(onlineUserId) === userId) {
        setIsOnline(true);
      }
    };

    // Update status when the user goes offline.
    const handleUserOffline = (offlineUserId) => {
      if (Number(offlineUserId) === userId) {
        setIsOnline(false);
      }
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    // Request the current online users.
    if (socket.connected) {
      socket.emit("getOnlineUsers");
    }

    // Remove listeners when the component changes or unmounts.
    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [user?.id]);

  // Show a message when no conversation is selected.
  if (!user) {
    return (
      <div className="h-[88px] flex items-center px-6 border-b border-gray-200 bg-white">
        <p className="text-gray-400">Select a conversation</p>
      </div>
    );
  }

  return (
    <div className="h-[88px] flex items-center justify-between px-6 border-b border-gray-200 bg-white">
      {/* User information */}
      <div className="flex items-center gap-3.5">
        <Link to={`/profile/${user.username}`}>
          <Avatar
            src={user.avatar}
            name={user.username}
            size="xl"
            showStatus={true}
            isOnline={isOnline}
          />
        </Link>

        <div>
          <Link
            to={`/profile/${user.username}`}
            className="text-base font-bold text-slate-800 hover:text-violet-600 transition block truncate"
          >
            {user.username}
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Developer</span>
            <span>•</span>

            <span
              className={
                isOnline
                  ? "text-emerald-600 font-semibold flex items-center gap-1"
                  : "text-slate-400"
              }
            >
              {isOnline ? "Active Now" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Chat actions */}
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Start voice call" className="rounded-full p-2 hover:bg-violet-100 hover:text-violet-600 transition">
          <Phone size={20} />
        </button>

        <button type="button" aria-label="Start video call" className="rounded-full p-2 hover:bg-violet-100 hover:text-violet-600 transition">
          <Video size={20} />
        </button>

        <button type="button" aria-label="More options" className="rounded-full p-2 hover:bg-violet-100 hover:text-violet-600 transition">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
