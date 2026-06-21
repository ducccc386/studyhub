import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';


interface Conversation {
  classSessionId: number;
  className: string;
  partnerId: number;
  partnerName: string;
  partnerAvatar: string;
  partnerRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

interface ChatMessage {
  id: number;
  classSessionId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  messageContent: string;
  sentAt: string;
  read: boolean;
}

const Messages: React.FC = () => {
  const { userId, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations (Mỗi khi load trang)
  useEffect(() => {
    if (!userId || !role) return;
    
    // Gọi một lần khi mount
    fetchConversations();

    // Polling conversations 10s một lần để cập nhật tin nhắn cuối cùng
    const convInterval = setInterval(fetchConversations, 10000);
    return () => clearInterval(convInterval);
  }, [userId, role]);

  const fetchConversations = async () => {
    try {
      const res = await apiFetch(`/chat/conversations?userId=${userId}&role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        if (loadingConv) {
          if (data.length > 0) setActiveConv(data[0]);
          setLoadingConv(false);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // 2. Fetch messages (Polling mỗi 3s khi đang chọn 1 cuộc hội thoại)
  useEffect(() => {
    if (!activeConv) return;
    
    fetchMessages(activeConv.classSessionId);

    const msgInterval = setInterval(() => {
      fetchMessages(activeConv.classSessionId);
    }, 3000);

    return () => clearInterval(msgInterval);
  }, [activeConv]);

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await apiFetch(`/chat/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const prevMsgCountRef = useRef(0);

  // Cuộn xuống dòng tin nhắn cuối chỉ khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length]);

  // 3. Send message
  const handleSend = async () => {
    if (!msgText.trim() || !activeConv || !userId) return;

    try {
      const payload = {
        senderId: userId,
        messageContent: msgText.trim()
      };
      
      const res = await apiFetch(`/chat/${activeConv.classSessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMsgText('');
        // Cập nhật ngay tin nhắn vào UI để không bị giật lag chờ polling
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingConv) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center animate-fade-in relative z-10 glass border border-white/20 rounded-3xl">
         <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] glass border border-white/20 rounded-3xl overflow-hidden flex shadow-xl animate-fade-in relative z-10">
      {/* Sidebar: Conversation List */}
      <div className="w-[320px] border-r border-outline-variant flex flex-col bg-surface-container/30 backdrop-blur-md">
        <div className="p-4 border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Tin nhắn</h2>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm cuộc trò chuyện..." 
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-highest/50 border border-transparent rounded-xl outline-none font-body-sm text-body-sm focus:bg-surface-container-lowest focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-on-surface-variant mt-10">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">forum</span>
              <p>Chưa có cuộc trò chuyện nào.</p>
              <p className="text-xs mt-1">Tính năng chat sẽ tự động mở khi Phụ huynh duyệt đơn ứng tuyển của Gia sư.</p>
            </div>
          ) : (
            conversations.map((conv, index) => (
              <div 
                key={conv.classSessionId} 
                onClick={() => setActiveConv(conv)}
                className={`flex items-start gap-3 p-4 cursor-pointer border-b border-outline-variant hover:bg-surface-container-low transition-all duration-200 animate-slide-up hover:-translate-y-0.5 ${activeConv?.classSessionId === conv.classSessionId ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative shrink-0">
                  <img src={conv.partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partnerName || 'User')}&background=random`} alt={conv.partnerName} className="w-12 h-12 rounded-full object-cover border border-outline-variant" />
                  {conv.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-label-md text-label-md truncate ${conv.unreadCount > 0 ? 'font-bold text-on-surface' : 'text-on-surface'}`}>{conv.partnerName}</h4>
                    <span className="font-body-sm text-body-sm text-[11px] text-on-surface-variant shrink-0">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-primary mb-0.5 truncate">{conv.className}</p>
                  <p className={`font-body-sm text-body-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center font-label-sm text-label-sm text-[10px]">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest/80 backdrop-blur-md relative">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] border-b border-outline-variant px-6 flex items-center justify-between bg-surface-container/30">
              <div className="flex items-center gap-3">
                <img src={activeConv.partnerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.partnerName || 'User')}&background=random`} alt={activeConv.partnerName} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                <div>
                  <h3 className="font-label-lg text-label-lg text-on-surface">{activeConv.partnerName}</h3>
                  <p className="font-body-sm text-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                    <span className="text-primary">{activeConv.className}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <button className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center tooltip" title="Gọi điện">
                  <span className="material-symbols-outlined">call</span>
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center tooltip" title="Video call">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center tooltip" title="Thêm thông tin">
                  <span className="material-symbols-outlined">info</span>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center h-full flex flex-col items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3 opacity-30">waving_hand</span>
                  <p>Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === userId;
                  const msgDate = new Date(msg.sentAt);
                  const timeString = `${msgDate.getHours().toString().padStart(2, '0')}:${msgDate.getMinutes().toString().padStart(2, '0')}`;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${(index % 10) * 20}ms` }}>
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-primary text-on-primary rounded-tr-sm bg-gradient-to-br from-primary to-primary-dark' : 'bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/50'}`}>
                        <p className="font-body-md text-body-md break-words">{msg.messageContent}</p>
                        <span className={`font-body-sm text-[10px] mt-1.5 block ${isMe ? 'text-on-primary/80 text-right' : 'text-on-surface-variant'}`}>{timeString}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-outline-variant bg-surface-container/30">
              <div className="flex items-end gap-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all shrink-0">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea 
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter để gửi)" 
                  className="flex-1 max-h-32 bg-transparent border-none outline-none resize-none font-body-md text-body-md py-2 min-h-[40px]"
                  rows={1}
                />
                <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all shrink-0">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!msgText.trim()}
                  className="p-2.5 bg-primary text-on-primary rounded-xl hover:bg-primary-dark transition-all shrink-0 flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-30">chat</span>
            <p className="text-lg font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
