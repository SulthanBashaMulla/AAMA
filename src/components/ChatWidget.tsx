import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, RefreshCw, Send, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

type ChatMessage = {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  retryText?: string;
};

const ROLE_LABELS = {
  student: 'student',
  faculty: 'faculty member',
  admin: 'administrator',
} as const;

export default function ChatWidget() {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const role = userProfile?.role;

  if (!role) return null;

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((current) => [...current, { id: Date.now(), text, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, role }),
      });
      let data: { response?: string; error?: string } = {};
      try {
        data = await result.json();
      } catch {
        throw new Error('The assistant is unavailable right now. Please try again shortly.');
      }
      if (!result.ok) throw new Error(data.error || 'The assistant could not respond.');
      if (!data.response) throw new Error('The assistant returned an empty response. Please try again.');
      const answer = data.response;
      setMessages((current) => [...current, { id: Date.now(), text: answer, sender: 'assistant' }]);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'The assistant could not respond.';
      setMessages((current) => [
        ...current,
        { id: Date.now(), text: errorText, sender: 'assistant', retryText: text },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function retry(message: ChatMessage) {
    setMessages((current) => current.filter((item) => item.id !== message.id));
    setInput(message.retryText ?? '');
  }

  return (
    <div className="fixed bottom-20 right-4 z-[60] md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            aria-label="AAMS Help Assistant"
            className="mb-4 flex h-[min(34rem,calc(100vh-8rem))] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-blue-800 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold">AAMS Help</h2>
                  <p className="text-xs text-blue-100">Guidance for {ROLE_LABELS[role]}s</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-1 hover:bg-blue-900">
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">
              {messages.length === 0 && (
                <div className="rounded-lg border border-blue-100 bg-white p-3 text-sm text-slate-600">
                  Ask about submitting certificates, reviewing activities, reports, or the AICTE 100-point requirement.
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${message.sender === 'user' ? 'bg-blue-800 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.retryText && (
                      <button type="button" onClick={() => retry(message)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-800">
                        <RefreshCw size={12} aria-hidden="true" /> Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500" aria-label="Assistant is typing">
                    <span className="mr-1 inline-block animate-bounce">.</span><span className="mr-1 inline-block animate-bounce [animation-delay:120ms]">.</span><span className="inline-block animate-bounce [animation-delay:240ms]">.</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask AAMS Help..." aria-label="Message AAMS Help" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100" maxLength={2000} />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message" className="rounded-lg bg-blue-800 px-3 text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? 'Close AAMS Help' : 'Open AAMS Help'} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition hover:bg-blue-900 hover:shadow-xl">
        {open ? <X size={23} aria-hidden="true" /> : <MessageCircle size={23} aria-hidden="true" />}
      </button>
    </div>
  );
}