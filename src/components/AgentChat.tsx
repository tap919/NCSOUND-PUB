import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, ChevronDown, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  tool_call?: { name: string; args: Record<string, string>; result?: string };
}

interface AgentChatProps {
  context?: {
    userId?: string;
    artistId?: string;
    role?: string;
  };
}

export default function AgentChat({ context }: AgentChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hey, I\'m your NcSound agent. Ask me about your catalog, splits, income, registrations, or anything you need help with.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, minimized]);

  const send = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const prevMessages = messagesRef.current;
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...prevMessages, userMsg].map(m => ({ role: m.role, content: m.content, tool_call: m.tool_call })),
          context,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I hit an error. Try again in a moment.' }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 text-black p-4 rounded-full shadow-2xl hover:bg-orange-400 transition-all hover:scale-110"
        title="Open AI Agent"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ${minimized ? 'bottom-6 right-6 w-72' : 'bottom-6 right-6 w-80 sm:w-96'}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-lg flex items-center justify-between px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Agent</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMinimized(!minimized)} className="text-neutral-500 hover:text-white p-1">
            <ChevronDown className={`w-4 h-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="bg-neutral-950 border-x border-neutral-800 max-h-96 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm font-sans ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-black'
                    : 'bg-neutral-800 text-neutral-100'
                }`}>
                  {msg.role === 'assistant' && msg.tool_call && (
                    <div className="text-[10px] text-neutral-500 mb-1 font-mono">
                      🔧 {msg.tool_call.name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                  <span className="text-xs text-neutral-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-b-lg p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything..."
              className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-white text-sm focus:border-orange-500 outline-none font-sans"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-orange-500 text-black p-2 hover:bg-orange-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
