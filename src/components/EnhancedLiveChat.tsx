import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface UserSession {
  sessionId: string;
  databaseId?: string;
  hubspotContactId?: string;
  escalated?: boolean;
}

const SUPPORT_EMAIL = 'info@innosinlab.com';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const QUICK_REPLIES = [
  'Browse Knee Space benches',
  'Mobile cabinets',
  'Request a quote',
  'Talk to a human',
];

const PRODUCT_LINK_REGEX = /\[PRODUCT:([^\]]+)\]/g;

function renderMessageContent(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const regex = new RegExp(PRODUCT_LINK_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    const href = match[1];
    const wordMatch = before.match(/([A-Za-z0-9][A-Za-z0-9\-_/]*)\s*$/);
    if (wordMatch) {
      const wordStart = before.length - wordMatch[0].length + (wordMatch[0].length - wordMatch[1].length);
      parts.push(before.slice(0, wordStart));
      parts.push(
        <Link key={`pl-${key++}`} to={href} className="text-primary underline font-medium hover:opacity-80" onClick={(e) => e.stopPropagation()}>
          {wordMatch[1]}
        </Link>
      );
    } else {
      parts.push(before);
      parts.push(<Link key={`pl-${key++}`} to={href} className="text-primary underline font-medium hover:opacity-80">View product</Link>);
    }
    lastIndex = match.index + match[0].length;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

function isHumanEscalation(text: string): boolean {
  const t = text.toLowerCase();
  return ['talk to a human', 'talk to human', 'speak to someone', 'speak to a human', 'real person', 'human agent', 'live agent'].some(p => t.includes(p));
}

const EnhancedLiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', company: '', phone: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const initializedRef = useRef(false);

  const { createContact, createTicket, syncConversation, loading } = useHubSpotIntegration();

  // Body scroll lock when open on mobile
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      initializeSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializeSession = async () => {
    const sessionId = generateUUID();
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          user_id: user?.user?.id || null,
          start_time: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        toast.error('Failed to initialize chat session');
        return;
      }

      setSession({ sessionId, databaseId: sessionData.id });

      const welcome: ChatMessage = {
        id: 'welcome',
        message: `Hi, I'm the Innosin Lab assistant. I can help with our Knee Space lab benches, Mobile Cabinet range, quotes, or general lab design questions. How can I help?`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcome]);
      await saveMessage(welcome, sessionData.id);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to initialize chat session');
    }
  };

  const saveMessage = async (msg: ChatMessage, sessionDatabaseId: string) => {
    try {
      await supabase.from('chat_messages').insert({
        session_id: sessionDatabaseId,
        message: msg.message,
        sender: msg.sender,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const appendMessage = (msg: ChatMessage) => {
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].id === msg.id) return prev;
      return [...prev, msg];
    });
  };

  const callAIChat = async (userMessage: string): Promise<ChatMessage> => {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message: userMessage, sessionId: session?.sessionId, contactId: session?.hubspotContactId },
    });
    if (error) throw new Error(error.message);
    if (!data?.message) throw new Error('Invalid response from AI chat');
    return {
      id: `bot_${Date.now()}`,
      message: data.message,
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleEscalateToHuman = async (triggerText: string) => {
    if (!session?.databaseId) return;
    const escalationMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      message: `I'm connecting you with a specialist. For immediate help, email ${SUPPORT_EMAIL}. Share your details below and we'll follow up directly.`,
      sender: 'bot',
      timestamp: new Date(),
    };
    appendMessage(escalationMsg);
    await saveMessage(escalationMsg, session.databaseId);
    setSession({ ...session, escalated: true });

    try {
      const summary = [...messages, escalationMsg].slice(-20)
        .map((m) => `${m.sender === 'user' ? 'Customer' : 'AI'}: ${m.message}`).join('\n\n');
      await createTicket({
        sessionId: session.sessionId,
        contactId: session.hubspotContactId,
        subject: `Human handoff: ${triggerText.substring(0, 60)}`,
        content: `Customer requested a human.\n\n${summary}`,
        priority: 'HIGH',
      });
    } catch (err) {
      console.error('Failed to create escalation ticket:', err);
    }
    if (!session.hubspotContactId) setTimeout(() => setShowContactForm(true), 600);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? message).trim();
    if (!text || !session?.databaseId) return;
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      message: text,
      sender: 'user',
      timestamp: new Date(),
    };
    appendMessage(userMessage);
    setMessage('');
    setIsTyping(true);
    await saveMessage(userMessage, session.databaseId);

    if (isHumanEscalation(text)) {
      setIsTyping(false);
      await handleEscalateToHuman(text);
      isSendingRef.current = false;
      return;
    }

    try {
      const aiResponse = await callAIChat(text);
      appendMessage(aiResponse);
      // Edge function already persists the bot message — do not double-save.
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        message: `I'm having trouble responding right now. Please try again, or email us at ${SUPPORT_EMAIL}.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      appendMessage(errorMessage);
      await saveMessage(errorMessage, session.databaseId);
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const handleQuickReply = (reply: string) => handleSendMessage(reply);

  const handleContactSubmit = async () => {
    const email = contactInfo.email?.trim().replace(/['"]/g, '');
    const name = contactInfo.name?.trim();
    const company = contactInfo.company?.trim();
    const phone = contactInfo.phone?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email) return toast.error('Please provide your name and email');
    if (!emailRegex.test(email)) return toast.error('Please provide a valid email');
    if (!session?.databaseId) return toast.error('Session not initialized');

    try {
      const result = await createContact({ sessionId: session.sessionId, email, name, company, phone });
      if (result?.contactId) {
        setSession({ ...session, hubspotContactId: result.contactId });
        await supabase.from('chat_sessions').update({
          email, name, company, phone, hubspot_contact_id: result.contactId,
        }).eq('id', session.databaseId);
        await syncConversation({ sessionId: session.sessionId, contactId: result.contactId });
        setShowContactForm(false);
        const confirm: ChatMessage = {
          id: `bot_${Date.now()}`,
          message: `Thanks ${name} — we've saved your details and our team will follow up shortly.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        appendMessage(confirm);
        await saveMessage(confirm, session.databaseId);
        toast.success('Contact saved');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to save contact information.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages: show bot icon only on first bot message in a consecutive group
  const isFirstInBotGroup = (idx: number) =>
    messages[idx].sender === 'bot' && (idx === 0 || messages[idx - 1].sender !== 'bot');

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="launcher"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999]"
          >
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open chat"
              className="relative h-14 w-14 sm:h-15 sm:w-15 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <span className="absolute inset-0 rounded-full bg-primary opacity-40 animate-ping" />
              <MessageCircle className="w-6 h-6 relative" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop (mobile only) + Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[9998] sm:bg-transparent sm:pointer-events-none"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed z-[9999] inset-x-4 bottom-4 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-[400px] sm:h-[600px] sm:max-h-[85vh] flex"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3.5 bg-gradient-to-r from-primary to-primary/85 text-primary-foreground flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/20">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">Innosin Lab AI</div>
                      <div className="text-[11px] opacity-90 flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        Expert Support · Online
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="relative flex-1 min-h-0 flex flex-col">
                  {showContactForm && (
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-5 rounded-xl w-full max-w-sm shadow-2xl"
                      >
                        <h3 className="text-base font-semibold mb-1">Share your details</h3>
                        <p className="text-xs text-muted-foreground mb-4">A specialist will follow up shortly.</p>
                        <div className="space-y-2.5">
                          <Input placeholder="Your name *" value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} />
                          <Input placeholder="Email *" type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                          <Input placeholder="Company" value={contactInfo.company} onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })} />
                          <Input placeholder="Phone" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={handleContactSubmit} disabled={loading} className="flex-1">
                            {loading ? 'Saving…' : 'Submit'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowContactForm(false)} className="flex-1">Cancel</Button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-2 bg-slate-50/40">
                    {messages.map((msg, idx) => {
                      const isUser = msg.sender === 'user';
                      const showIcon = !isUser && isFirstInBotGroup(idx);
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                            {!isUser && (
                              <div className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ${showIcon ? 'opacity-100' : 'opacity-0'}`}>
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div
                              className={`px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                                isUser
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-white text-foreground border border-slate-200/70 rounded-bl-sm shadow-sm'
                              }`}
                            >
                              <div className="whitespace-pre-line break-words">
                                {isUser ? msg.message : renderMessageContent(msg.message)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {isTyping && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="flex items-end gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200/70 shadow-sm">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick replies (only before user has sent anything) */}
                  {!messages.some(m => m.sender === 'user') && messages.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-200/70 bg-white shrink-0">
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_REPLIES.map((reply) => (
                          <button
                            key={reply}
                            className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-white hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                            onClick={() => handleQuickReply(reply)}
                            disabled={isTyping}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-slate-200/70 bg-white shrink-0">
                    <div className="flex items-center gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message…"
                        className="flex-1 text-sm rounded-full border-slate-200 bg-slate-50 focus-visible:ring-primary/30"
                        onKeyPress={handleKeyPress}
                        disabled={isTyping}
                      />
                      <Button
                        size="icon"
                        className="rounded-full bg-primary hover:bg-primary/90 shrink-0 h-10 w-10"
                        onClick={() => handleSendMessage()}
                        disabled={isTyping || !message.trim()}
                        aria-label="Send"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedLiveChat;
