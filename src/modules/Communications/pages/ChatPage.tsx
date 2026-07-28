import { useEffect, useState } from 'react';
import { webSocketService } from '../../../services/websocket.service';
import { ChatWindow } from '../components/ChatWindow';
import { MessengerSidebar } from '../components/MessengerSidebar';
import { TemplateLibrary } from '../components/TemplateLibrary';
import { useMessages } from '../hooks/useMessages';
import { chatService } from '../services/chat.service';

const activeUser = {
  id: 'u-1',
  name: 'Anna Levchenko',
  avatar: 'https://i.pravatar.cc/64?img=15'
};

export const ChatPage = () => {
  const { threads, activeChatId, setActiveChatId, messages, typingUsers, sendMessage, markTyping } =
    useMessages();

  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    chatService.fetchThreads();
    
    // Connect WebSocket
    const token = localStorage.getItem('accessToken') || '';
    if (token) {
      webSocketService.connect(token);
    }
    
    const handleStatus = (data: any) => {
      setWsConnected(data.connected);
    };
    
    webSocketService.on('status', handleStatus);
    setWsConnected(webSocketService.isConnected);

    return () => {
      webSocketService.off('status', handleStatus);
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex min-h-[400px] flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
        <MessengerSidebar
          threads={threads}
          activeChatId={activeChatId}
          onSelect={setActiveChatId}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Internal Messenger</h2>
              <p className="text-xs text-slate-500">
                Online statuses, read receipts and threads in real time
              </p>
            </div>
            {wsConnected ? (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                WebSocket connected
              </span>
            ) : (
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-300">
                WebSocket disconnected
              </span>
            )}
          </div>
          <ChatWindow
            messages={messages}
            activeUser={activeUser}
            typingUsers={typingUsers}
            onSend={async (content) => {
              await sendMessage(content, activeUser);
            }}
            onTyping={() => markTyping(activeUser.id)}
          />
        </div>
      </div>
      <TemplateLibrary />
    </div>
  );
};
