
import { useEffect, useRef, useState } from "react";

import ConversationList from "../../components/chats/ConversationList";
import ChatWindow from "../../components/chats/ChatWindow";
import Sidebar from "../../components/sidebar";

import { getConversations } from "../../services/conversation";
import { socket } from "../../socket/socket";
import { useAuth } from "../../hooks/useAuth";

const Chat = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keeps the latest selected conversation available to socket handlers.
  const selectedConversationRef = useRef(null);

  // Keep the ref updated whenever the selected conversation changes.
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Fetch conversations and restore the previously selected conversation.
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        const conversationList = Array.isArray(data) ? data : [];

        setConversations(conversationList);

        const savedConversationId = sessionStorage.getItem(
          "selectedConversationId"
        );

        if (savedConversationId) {
          const savedConversation = conversationList.find(
            (conversation) =>
              Number(conversation.conversationId) ===
              Number(savedConversationId)
          );

          if (savedConversation) {
            setSelectedConversation(savedConversation);
            selectedConversationRef.current = savedConversation;
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Connect the socket and register the logged-in user.
  useEffect(() => {
    if (!user?.id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register", Number(user.id));
  }, [user?.id]);

  // Handle incoming messages and update the conversation list.
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (!message?.conversationId) return;

      setConversations((previousConversations) => {
        const conversationIndex = previousConversations.findIndex(
          (conversation) =>
            Number(conversation.conversationId) ===
            Number(message.conversationId)
        );

        // Ignore messages for conversations not currently in the list.
        if (conversationIndex === -1) {
          return previousConversations;
        }

        const conversation = previousConversations[conversationIndex];

        const currentConversationId =
          selectedConversationRef.current?.conversationId;

        const isCurrentConversation =
          Number(currentConversationId) ===
          Number(message.conversationId);

        const updatedConversation = {
          ...conversation,
          lastMessage: message,
          updatedAt: message.createdAt || new Date().toISOString(),
          unreadCount: isCurrentConversation
            ? 0
            : (conversation.unreadCount || 0) + 1,
        };

        // Remove the conversation from its old position.
        const remainingConversations = previousConversations.filter(
          (_, index) => index !== conversationIndex
        );

        // Move the updated conversation to the top.
        return [updatedConversation, ...remainingConversations];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  // Select a conversation and clear its unread count.
  const handleSelectConversation = (conversation) => {
    if (!conversation) return;

    setSelectedConversation(conversation);
    selectedConversationRef.current = conversation;

    sessionStorage.setItem(
      "selectedConversationId",
      conversation.conversationId
    );

    setConversations((previousConversations) =>
      previousConversations.map((item) =>
        Number(item.conversationId) ===
          Number(conversation.conversationId)
          ? { ...item, unreadCount: 0 }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-slate-100">
      {/* Navigation Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 h-full border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Conversation List */}
      <aside className="w-80 sm:w-96 flex-shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={handleSelectConversation}
        />
      </aside>

      {/* Chat Window */}
      <main className="flex-1 min-w-0 h-full flex flex-col bg-slate-50">
        <ChatWindow
          conversation={selectedConversation}
          setConversations={setConversations}
        />
      </main>
    </div>
  );
};

export default Chat;
