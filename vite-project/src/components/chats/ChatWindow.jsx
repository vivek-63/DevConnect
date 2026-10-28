import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatSend from "./ChatSend";

import { socket } from "../../socket/socket";
import { getMessages, markMessagesAsRead } from "../../services/conversation";

const ChatWindow = ({ conversation, setConversations }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ================================
  // Fetch messages
  // ================================
  useEffect(() => {
    if (!conversation?.conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const data = await getMessages(
          conversation.conversationId
        );

        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?.conversationId]);

  // ================================
  // Receive real-time messages
  // ================================
  useEffect(() => {
    if (!conversation?.conversationId) return;

    const handleNewMessage = (message) => {
      console.log("🔥 New message received:", message);

      // Make sure message belongs to current conversation
      if (
        Number(message.conversationId) !==
        Number(conversation.conversationId)
      ) {
        return;
      }

      setMessages((prev) => {
        // Prevent duplicate message
        const alreadyExists = prev.some(
          (item) => item.id === message.id
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, message];
      });
    };

    socket.on("newMessage", handleNewMessage);

    // Cleanup listener
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversation?.conversationId]);

  // ================================
  // Scroll to bottom
  // ================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
  if (!conversation?.conversationId) return;

  const markRead = async () => {
    try {
      await markMessagesAsRead(
        conversation.conversationId
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  markRead();
}, [conversation?.conversationId]);

  // ================================
  // No conversation selected
  // ================================
  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-700">
            Select a conversation
          </h2>

          <p className="mt-2 text-gray-400">
            Choose someone from your conversations to start chatting.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-w-0 bg-gray-50">

      {/* =================================
          Chat Header
      ================================= */}
      <div className="flex-shrink-0">
        <ChatHeader
          user={conversation.otherUser}
        />
      </div>

      {/* =================================
          Messages
      ================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">

        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">
              Loading messages...
            </p>
          </div>
        ) : (
          <>
            <ChatMessage messages={messages} />

            {/* Scroll target */}
            <div ref={messagesEndRef} />
          </>
        )}

      </div>

      {/* =================================
          Message Input
      ================================= */}
      <div className="flex-shrink-0">
        <ChatSend
          conversationId={conversation.conversationId}
          setMessages={setMessages}
          setConversations={setConversations}
        />
      </div>

    </div>
  );
};

export default ChatWindow;