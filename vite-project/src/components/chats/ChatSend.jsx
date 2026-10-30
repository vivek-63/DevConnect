
import { useState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "../../services/conversation";

const ChatSend = ({ conversationId, setMessages, setConversations }) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const messageContent = content.trim();

    // Don't send empty messages or submit twice.
    if (!messageContent || !conversationId || sending) {
      return;
    }

    try {
      setSending(true);

      // Send the message to the backend.
      const response = await sendMessage(
        conversationId,
        messageContent
      );

      const message = response?.message || response;

      if (message) {
        const newMessage = {
          ...message,
          createdAt: message.createdAt || new Date().toISOString(),
        };

        // Add the message without creating duplicates.
        setMessages((previousMessages) => {
          const alreadyExists = previousMessages.some(
            (item) => item.id === newMessage.id
          );

          if (newMessage.id && alreadyExists) {
            return previousMessages;
          }

          return [...previousMessages, newMessage];
        });

        // Update the conversation in the sidebar.
        if (typeof setConversations === "function") {
          setConversations((previousConversations) => {
            const conversationIndex = previousConversations.findIndex(
              (item) =>
                Number(item.conversationId) === Number(conversationId)
            );

            if (conversationIndex === -1) {
              return previousConversations;
            }

            const updatedConversation = {
              ...previousConversations[conversationIndex],
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt,
            };

            const otherConversations = previousConversations.filter(
              (_, index) => index !== conversationIndex
            );

            // Move the updated conversation to the top.
            return [updatedConversation, ...otherConversations];
          });
        }
      }

      // Clear the input after a successful request.
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
        aria-label="Write a message"
        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
      />

      <button
        type="submit"
        disabled={sending || !content.trim()}
        aria-label="Send message"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={19} />
      </button>
    </form>
  );
};

export default ChatSend;
