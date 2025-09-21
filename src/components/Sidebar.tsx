import { MessageSquare, Settings, Clock } from "lucide-react";
import { Button } from "../components/ui/button";

interface Chat {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
}

export const Sidebar = ({
  chats,
  currentChatId,
  onNewChat,
  onLoadChat,
}: SidebarProps) => {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col justify-between h-full">
      <div>
        <div className="px-4 py-[10px] border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            NIA
          </h1>
        </div>

        <div className="p-4 space-y-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-gradient-primary hover:shadow-glow text-white transition-smooth"
            size="sm"
          >
            <MessageSquare className="w-4 h-4" />
            New Chat
          </Button>

          {/* Chat History */}
          {chats.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recent Chats
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    onClick={() => onLoadChat(chat.id)}
                    variant={currentChatId === chat.id ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left p-2 h-auto"
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs truncate w-full">
                        {chat.title}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {chat.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
};
