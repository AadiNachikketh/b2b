import React, { useState } from 'react';
import { MessageSquare, X, Send, ArrowRight } from 'lucide-react';
import { trackConversionEvent } from './SEOHead';
import { sendChatWithFallback, submitLeadWithFallback } from '../utils/staticFallback';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
}

interface AIChatbotWidgetProps {
  onNavigate: (path: string) => void;
  onLeadCaptured?: () => void;
}

export function AIChatbotWidget({ onNavigate, onLeadCaptured }: AIChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am the Mehula ADMediaTek Search & SaaS Assistant. Ask me about our technical SEO services, SaaS subscription tiers, or how our automated audit works.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadWebsite, setLeadWebsite] = useState('');
  const [leadGoal, setLeadGoal] = useState('Technical SEO & SaaS Audit');
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState('');

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      trackConversionEvent('chatbot_opened');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendChatWithFallback(
        trimmed,
        nextHistory.map((m) => ({ role: m.role, text: m.text }))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            reply ||
            'We can help investigate that. Would you like to run a Free SEO Audit or request a consultation?'
        }
      ]);
      if (nextHistory.length >= 2 && !leadSubmitted) {
        setShowLeadCapture(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Our assistant is temporarily offline. You can run an instant check on the Free SEO Audit page or leave your work email below.'
        }
      ]);
      setShowLeadCapture(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');
    if (!leadName.trim() || !leadEmail.trim()) {
      setLeadError('Please provide your name and work email.');
      return;
    }
    if (!leadConsent) {
      setLeadError('Please check the consent box to submit your details.');
      return;
    }

    try {
      const result = await submitLeadWithFallback({
        name: leadName,
        email: leadEmail,
        company: leadWebsite || 'Chatbot Inquiry',
        websiteUrl: leadWebsite,
        serviceInterest: leadGoal,
        message: `Chatbot lead capture. Goal: ${leadGoal}`,
        preferredContact: 'Email',
        source: 'ai_chatbot',
        consentStatus: leadConsent
      });
      if (!result.ok) {
        setLeadError(result.error || 'Could not save inquiry.');
        return;
      }
      setLeadSubmitted(true);
      setShowLeadCapture(false);
      trackConversionEvent('chatbot_lead_submitted');
      if (onLeadCaptured) onLeadCaptured();
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          text: `Thank you, ${leadName}. Your inquiry has been logged in our CRM pipeline and a specialist will follow up at ${leadEmail}.`
        }
      ]);
    } catch {
      setLeadError('Network error while saving inquiry.');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="AI Search & SaaS Inquiry Assistant"
          className="w-[360px] max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="bg-[#101828] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-tight">Mehula Search Assistant</p>
              <p className="text-[11px] text-slate-300">AI-Assisted · Verified Agency Knowledge Base</p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Close assistant"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-[#F6F8FC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs leading-relaxed p-3 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-[#3157E8] text-white ml-6'
                    : 'bg-white text-slate-800 border border-slate-200 mr-4'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-slate-500 bg-white border border-slate-200 p-3 rounded-lg mr-4">
                Analyzing approved service documentation...
              </div>
            )}

            {showLeadCapture && !leadSubmitted && (
              <form
                onSubmit={handleLeadSubmit}
                className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 text-xs"
              >
                <p className="font-semibold text-slate-900">Request Specialist Follow-Up</p>
                <p className="text-[11px] text-slate-600">
                  Leave your work email and website URL for a tailored technical review.
                </p>
                {leadError && <p className="text-red-600 text-[11px] font-medium">{leadError}</p>}
                <div>
                  <label htmlFor="chat-lead-name" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    Your Name
                  </label>
                  <input
                    id="chat-lead-name"
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Aarav Mehta"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="chat-lead-email" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    Work Email
                  </label>
                  <input
                    id="chat-lead-email"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="aarav@company.com"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="chat-lead-url" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    Company Website
                  </label>
                  <input
                    id="chat-lead-url"
                    type="text"
                    value={leadWebsite}
                    onChange={(e) => setLeadWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="chat-lead-goal" className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    Primary Focus
                  </label>
                  <select
                    id="chat-lead-goal"
                    value={leadGoal}
                    onChange={(e) => setLeadGoal(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Technical SEO & SaaS Audit">Technical SEO & SaaS Audit</option>
                    <option value="Local SEO">Local SEO</option>
                    <option value="National SEO">National SEO</option>
                    <option value="E-commerce SEO">E-commerce SEO</option>
                    <option value="SaaS Subscription Plan">SaaS Subscription Plan</option>
                  </select>
                </div>
                <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadConsent}
                    onChange={(e) => setLeadConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I consent to Mehula ADMediaTek storing my inquiry for consultation follow-up.</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#3157E8] text-white font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    Save Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeadCapture(false)}
                    className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigate('/free-seo-audit/');
              }}
              className="hover:text-[#3157E8] font-medium flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Run Free Audit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            {!showLeadCapture && !leadSubmitted && (
              <button
                type="button"
                onClick={() => setShowLeadCapture(true)}
                className="hover:text-[#3157E8] font-medium whitespace-nowrap shrink-0"
              >
                Leave Contact Info
              </button>
            )}
          </div>

          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <label htmlFor="chatbot-input" className="sr-only">
              Ask a question about SEO services or SaaS plans
            </label>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, audits, or pricing..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#3157E8]"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="p-2 bg-[#3157E8] text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Open SEO Assistant"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#101828] text-white text-xs font-medium rounded-lg shadow-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <MessageSquare className="w-4 h-4 text-[#3157E8]" />
          <span>SEO & SaaS Assistant</span>
        </button>
      )}
    </div>
  );
}
