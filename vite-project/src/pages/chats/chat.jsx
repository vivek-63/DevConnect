import { useEffect, useRef, useState } from "react";

import ConversationList from "../../components/chats/ConversationList";
import ChatWindow from "../../components/chats/ChatWindow";

import { getConversations } from "../../services/conversation";
import { socket } from "../../socket/socket";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../hooks/useAuth";

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [loading, setLoading] = useState(true);

  // Keep latest selected conversation available
  // inside socket event handlers
  const selectedConversationRef = useRef(null);

  // ==========================================
  // Keep ref synchronized
  // ==========================================
  useEffect(() => {
    selectedConversationRef.current =
      selectedConversation;
  }, [selectedConversation]);

  // ==========================================
  // Fetch conversations
  // ==========================================
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();

        const conversationList = Array.isArray(data)
          ? data
          : [];

        console.log(
          "Conversations:",
          conversationList
        );

        setConversations(conversationList);

        // ======================================
        // Restore selected conversation
        // after refresh
        // ======================================
        const savedConversationId =
          sessionStorage.getItem(
            "selectedConversationId"
          );

        if (savedConversationId) {
          const savedConversation =
            conversationList.find(
              (conversation) =>
                Number(
                  conversation.conversationId
                ) === Number(savedConversationId)
            );

          if (savedConversation) {
            setSelectedConversation(
              savedConversation
            );

            selectedConversationRef.current =
              savedConversation;
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch conversations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // ==========================================
  // Socket connection + registration
  // ==========================================
  useEffect(() => {
    if (!user?.id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register", Number(user.id));
    console.log("Socket registered for user:", user.id);
  }, [user?.id]);

  // ==========================================
  // REALTIME MESSAGE
  // ==========================================
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log(
        "🔥 REALTIME MESSAGE RECEIVED:",
        message
      );

      if (!message?.conversationId) {
        console.log(
          "Invalid realtime message"
        );

        return;
      }

      setConversations((prev) => {
        const conversationIndex =
          prev.findIndex(
            (conversation) =>
              Number(
                conversation.conversationId
              ) ===
              Number(message.conversationId)
          );

        // ====================================
        // Conversation doesn't exist
        // ====================================
        if (conversationIndex === -1) {
          console.log(
            "Conversation not found in sidebar:",
            message.conversationId
          );

          return prev;
        }

        const conversation =
          prev[conversationIndex];

        // ====================================
        // Check if currently open
        // ====================================
        const currentConversationId =
          selectedConversationRef.current
            ?.conversationId;

        const isCurrentConversation =
          Number(currentConversationId) ===
          Number(message.conversationId);

        // ====================================
        // Update conversation
        // ====================================
        const updatedConversation = {
          ...conversation,

          lastMessage: message,

          updatedAt:
            message.createdAt ||
            new Date().toISOString(),

          unreadCount:
            isCurrentConversation
              ? 0
              : (conversation.unreadCount || 0) +
                1,
        };

        // ====================================
        // Remove old position
        // ====================================
        const newList = prev.filter(
          (_, index) =>
            index !== conversationIndex
        );

        // ====================================
        // Move conversation to top
        // ====================================
        return [
          updatedConversation,
          ...newList,
        ];
      });
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );
    };
  }, []);

  // ==========================================
  // Select conversation
  // ==========================================
  const handleSelectConversation = (
    conversation
  ) => {
    if (!conversation) return;

    console.log(
      "Selected conversation:",
      conversation
    );

    // Update state
    setSelectedConversation(
      conversation
    );

    // Update ref immediately
    selectedConversationRef.current =
      conversation;

    // Save for refresh
    sessionStorage.setItem(
      "selectedConversationId",
      conversation.conversationId
    );

    // Remove unread count
    setConversations((prev) =>
      prev.map((item) =>
        Number(
          item.conversationId
        ) ===
        Number(
          conversation.conversationId
        )
          ? {
              ...item,
              unreadCount: 0,
            }
          : item
      )
    );
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading conversations...
        </p>
      </div>
    );
  }

  // ==========================================
  // Total unread messages
  // ==========================================
  const unreadMessageCount =
    conversations.reduce(
      (total, conversation) =>
        total +
        (conversation.unreadCount || 0),
      0
    );

  console.log(
    "Unread messages:",
    unreadMessageCount
  );

  // ==========================================
  // UI
  // ==========================================
 
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