
import MessageBubble from "./MessageBubble";

const ChatMessage = ({ messages }) => {
  // Show a message when the conversation is empty.
  if (!messages || messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  // Display all messages in the conversation.
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};

export default ChatMessage;
