import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Clock,
  CheckCircle,
  UserCircle,
  Headphones,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getUserById, getSession } from '@/lib/store';
import type { User } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

export default function ChatSupport() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'user') {
      navigate('/');
      return;
    }
    const u = getUserById(session.userId!);
    if (u) {
      setUser(u);
      setMessages([
        {
          id: 'welcome',
          sender: 'support',
          text: `Hello ${u.firstName}, welcome to AtlasLedger Business Support. How can I assist you today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResponses = [
    "I've reviewed your account. Your recent transaction is processing normally and should complete within 1-2 business days.",
    "For international wire transfers, please allow 1-3 business days for processing. You can track the status in your Transactions page.",
    "Your loan eligibility is calculated based on account activity, balance history, and repayment behavior. I can see your current score is looking good.",
    "To update your business information, please visit the Profile section from your dashboard. For security-sensitive changes, we'll require additional verification.",
    "Your crypto wallet is secured with institutional-grade encryption. All transactions require OTP and PIN verification for added security.",
    "Is there anything else I can help you with regarding your AtlasLedger business account?",
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      const supportMsg: ChatMessage = {
        id: `msg_${Date.now()}_reply`,
        sender: 'support',
        text: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-8">
        <Headphones className="w-6 h-6 text-[#001845]" />
        <h1 className="text-2xl font-semibold text-[#001845]">Business Support</h1>
      </div>

      <div className="max-w-3xl mx-auto bg-white border-t-2 border-[#001845] flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#DEE2E6]">
          <div className="w-10 h-10 bg-[#001233] flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#001845]">AtlasLedger Support</p>
            <p className="text-xs text-[#2A9D8F] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-[#EDF2FB]' : 'bg-[#001233]'
                }`}
              >
                {msg.sender === 'user' ? (
                  <UserCircle className="w-4 h-4 text-[#001845]" />
                ) : (
                  <Headphones className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] p-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#001233] text-white'
                    : 'bg-[#F8F9FA] text-[#001845]'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-white/50' : 'text-[#8D99AE]'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 flex-shrink-0 bg-[#001233] flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#F8F9FA] p-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8D99AE] animate-spin" />
                  <span className="text-xs text-[#8D99AE]">Support is typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#DEE2E6]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-[#DEE2E6] bg-[#F8F9FA] text-[#001845] focus:outline-none focus:border-[#001845]"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-3 bg-[#001233] text-white hover:bg-[#001845] transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
