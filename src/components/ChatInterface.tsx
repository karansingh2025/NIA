import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { MessageInput } from "./MessageInput";
import { BrowserCompatibilityBanner } from "./BrowserCompatibilityBanner";
import { Button } from "./ui/button";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useMonochrome } from "../context/MonochromeContext";
import axios from "axios";

export interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { isMonochrome, toggleMonochrome } = useMonochrome();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  const updateCurrentChat = (newMessages: Message[]) => {
    if (!currentChatId) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: newMessages,
              updatedAt: new Date(),
              title:
                newMessages.length > 0
                  ? newMessages[0].content.slice(0, 30) + "..."
                  : "New Chat",
            }
          : chat
      )
    );
  };

  const loadChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat();
    }

    // First, add the user's message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: "user",
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateCurrentChat(updatedMessages);

    try {
      // Then make the API call and add the assistant's response
      const response = await axios.post("https://nia-2-0.onrender.com/ask", {
        query: content.trim(),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          response?.data?.response ||
          "Sorry, I couldn't process your request right now.",
        type: "assistant",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      updateCurrentChat(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message if API call fails
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I'm having trouble connecting to the server. Please try again later.",
        type: "assistant",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentChat(finalMessages);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground relative">
      {/* Collapsible Sidebar */}
      <div
        className={`transition-all duration-300 border-r border-border bg-card ${
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
        }`}
      >
        {!isSidebarCollapsed && (
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={createNewChat}
            onLoadChat={loadChat}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar with Hamburger */}
        <div className="p-2 flex items-center gap-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="w-8 h-8 p-0"
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
          <div className="flex-1">
            <BrowserCompatibilityBanner />
          </div>
        </div>

        <ChatArea messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>

      {/* Theme Toggle Button - Bottom Right */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMonochrome}
        className="fixed bottom-4 right-4 w-10 h-10 p-0 rounded-full shadow-lg z-50"
        title={
          isMonochrome ? "Switch to Color Mode" : "Switch to Black & White Mode"
        }
      >
        {isMonochrome ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
