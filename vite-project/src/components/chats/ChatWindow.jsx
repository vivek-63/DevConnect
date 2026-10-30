
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatSend from "./ChatSend";

import { socket } from "../../socket/socket";
import {
  getMessages,
  markMessagesAsRead,
} from "../../services/conversation";

const ChatWindow = ({ conversation, setConversations }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const conversationId = conversation?.conversationId;

  // Fetch messages when the selected conversation changes.
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const data = await getMessages(conversationId);

        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Listen for new messages from the server.
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const handleNewMessage = (message) => {
      // Ignore messages from other conversations.
      if (
        Number(message.conversationId) !== Number(conversationId)
      ) {
        return;
      }

      setMessages((previousMessages) => {
        // Avoid adding the same message twice.
        const alreadyExists = previousMessages.some(
          (item) => item.id === message.id
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, message];
      });
    };

    socket.on("newMessage", handleNewMessage);

    // Remove the listener when the conversation changes.
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId]);

  // Scroll to the latest message whenever the list changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Mark messages as read when a conversation is selected.
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const markRead = async () => {
      try {
        await markMessagesAsRead(conversationId);
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    };

    markRead();
  }, [conversationId]);

  // Show a placeholder if no conversation is selected.
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
      {/* Chat header */}
      <div className="flex-shrink-0">
        <ChatHeader user={conversation.otherUser} />
      </div>

      {/* Message list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : (
          <>
            <ChatMessage messages={messages} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="flex-shrink-0">
        <ChatSend
          conversationId={conversationId}
          setMessages={setMessages}
          setConversations={setConversations}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
