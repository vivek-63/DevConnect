import { useState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "../../services/conversation";


const ChatSend = ({ conversationId, setMessages, setConversations }) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || !conversationId || sending) {
      return;
    }

    try {
      setSending(true);

      const res = await sendMessage(
        conversationId,
        content.trim()
      );

      const rawMessage = res?.message || res;
      if (rawMessage) {
        const newMessage = {
          ...rawMessage,
          createdAt: rawMessage.createdAt || new Date().toISOString(),
        };

        // Immediately show the message without duplicating
        setMessages((prev) => {
          if (newMessage.id && prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Update conversation sidebar last message & timestamp
        if (typeof setConversations === "function") {
          setConversations((prev) => {
            const idx = prev.findIndex(
              (c) => Number(c.conversationId) === Number(conversationId)
            );
            if (idx === -1) return prev;
            const updated = {
              ...prev[idx],
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt,
            };
            const filtered = prev.filter((_, i) => i !== idx);
            return [updated, ...filtered];
          });
        }
      }

      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 bg-white border-t border-gray-200"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a message..."
        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none
                   focus:ring-2 focus:ring-violet-500"
      />

      <button
        type="submit"
        disabled={sending || !content.trim()}
        className="w-11 h-11 flex items-center justify-center
                   rounded-full bg-violet-600 text-white
                   hover:bg-violet-700 disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        <Send size={19} />
      </button>
    </form>
  );
};

export default ChatSend;