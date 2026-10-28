import React, { useState } from "react";
import ConversationCard from "./ConversationCard";
import { FiSearch } from "react-icons/fi";

const ConversationList = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
}) => {
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const username = c.otherUser?.username?.toLowerCase() || "";
    const content = c.lastMessage?.content?.toLowerCase() || "";
    return username.includes(q) || content.includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 sm:p-5 flex-shrink-0 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Messages
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
            {conversations.length}
          </span>
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <FiSearch size={15} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
            <p className="font-semibold text-slate-500 mb-1">
              {search.trim() ? "No matches found" : "No conversations yet"}
            </p>
            <p className="text-[11px]">
              {search.trim()
                ? `No conversations matching "${search}"`
                : "Connect with developers to start chatting"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.conversationId}
              conversation={conversation}
              active={
                Number(selectedConversation?.conversationId) ===
                Number(conversation.conversationId)
              }
              onClick={() => setSelectedConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;