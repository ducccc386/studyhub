import React, { useState, useRef, useEffect } from 'react';


interface Message {
  id: number;
  role: 'bot' | 'user';
  text: React.ReactNode;
  options?: string[];
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn? 👋',
    },
    {
      id: 2,
      role: 'bot',
      text: 'Bạn đang quan tâm đến:',
      options: ['1. Hướng dẫn đăng bài', '2. Cách tính học phí', '3. Liên hệ Admin']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg: Message = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');

    // Add loading message
    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingId, role: 'bot', text: 'Đang trả lời...' }]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === loadingId ? { ...msg, text: data.reply } : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === loadingId ? { ...msg, text: 'Hệ thống đang bận, vui lòng thử lại sau.' } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? { ...msg, text: 'Lỗi kết nối máy chủ.' } : msg
      ));
    }
  };

  return (
    <>
      {/* Nút Chat nổi */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">
        {/* Tooltip */}
        <div 
          className={`bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform origin-right ${isHovered || isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
        >
          Hỗ trợ trực tuyến
        </div>

        {/* Nút hình tròn */}
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#00798C] hover:bg-[#005f6e] text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 8px 24px rgba(0, 121, 140, 0.4)' }}
        >
          <span className="material-symbols-outlined text-[28px]">
            {isOpen ? 'close' : 'forum'}
          </span>
        </button>
      </div>

      {/* Khung Chat thu nhỏ */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] bg-surface border border-outline-variant rounded-2xl shadow-2xl z-[99] flex flex-col overflow-hidden animate-slide-up origin-bottom-right">
          {/* Header */}
          <div className="bg-[#00798C] px-5 py-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-2xl">support_agent</span>
              <div>
                <h3 className="font-bold text-base">StudyHub Support</h3>
                <p className="text-xs text-white/80">Chúng tôi trả lời ngay lập tức</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <span className="material-symbols-outlined">minimize</span>
            </button>
          </div>

          {/* Chat Body */}
          <div className="h-[350px] p-4 flex flex-col gap-4 overflow-y-auto bg-slate-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#00798C] text-white flex items-center justify-center flex-shrink-0 mt-auto">
                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#00798C] text-white rounded-2xl rounded-br-sm' : 'bg-white border border-outline-variant text-on-surface rounded-2xl rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  
                  {/* Nếu có options (gợi ý) */}
                  {msg.options && (
                    <div className="flex flex-col gap-2 w-full mt-1">
                      {msg.options.map((opt, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleSend(opt)}
                          className="text-left text-primary text-sm font-medium hover:bg-primary/5 px-3 py-2 rounded-xl border border-primary/20 transition-colors bg-white shadow-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer */}
          <div className="p-4 bg-white border-t border-outline-variant">
            <form 
              className="relative flex items-center"
              onSubmit={e => { e.preventDefault(); handleSend(inputText); }}
            >
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="w-full bg-surface-variant border-transparent focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-2.5 pl-4 pr-12 text-sm outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className={`absolute right-2 p-1.5 rounded-full transition-colors flex items-center justify-center ${inputText.trim() ? 'text-[#00798C] hover:bg-[#00798C]/10' : 'text-on-surface-variant/50 cursor-not-allowed'}`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
