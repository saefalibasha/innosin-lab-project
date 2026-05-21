import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Bot, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  confidence?: number;
}

interface UserSession {
  sessionId: string;
  databaseId?: string;
  email?: string;
  name?: string;
  company?: string;
  phone?: string;
  startTime: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  hubspotContactId?: string;
  escalated?: boolean;
}

const SUPPORT_EMAIL = 'info@innosinlab.com';

// Generate a UUID v4 (edge function requires UUID session ids)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const QUICK_REPLIES = [
  'Browse Products',
  'Request a Quote',
  'Technical Support',
  'Talk to a Human',
];

const PRODUCT_LINK_REGEX = /\[PRODUCT:([^\]]+)\]/g;

/**
 * Render message text and convert [PRODUCT:/path] markers into inline links.
 * The marker decorates the immediately-preceding token (product code) as the link.
 */
function renderMessageContent(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const regex = new RegExp(PRODUCT_LINK_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    const href = match[1];

    // Find the preceding word/code (letters, digits, dashes) to use as link label
    const wordMatch = before.match(/([A-Za-z0-9][A-Za-z0-9\-_/]*)\s*$/);
    if (wordMatch) {
      const wordStart = before.length - wordMatch[0].length + (wordMatch[0].length - wordMatch[1].length);
      parts.push(before.slice(0, wordStart));
      parts.push(
        <Link
          key={`pl-${key++}`}
          to={href}
          className="text-sea underline font-medium hover:text-sea-dark"
          onClick={(e) => e.stopPropagation()}
        >
          {wordMatch[1]}
        </Link>
      );
    } else {
      parts.push(before);
      parts.push(
        <Link
          key={`pl-${key++}`}
          to={href}
          className="text-sea underline font-medium hover:text-sea-dark"
        >
          View product
        </Link>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

function isHumanEscalation(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('talk to a human') ||
    t.includes('talk to human') ||
    t.includes('speak to someone') ||
    t.includes('speak to a human') ||
    t.includes('real person') ||
    t.includes('human agent') ||
    t.includes('live agent')
  );
}

const EnhancedLiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', company: '', phone: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createContact, createTicket, syncConversation, loading } = useHubSpotIntegration();

  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      const newSession: UserSession = {
        sessionId,
        databaseId: sessionData.id,
        startTime: new Date(),
        lastActivity: new Date(),
        messages: [],
      };
      setSession(newSession);

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: `Hi! I'm the Innosin Lab AI assistant. I can help with product info, quotes, installation, and technical questions about our laboratory safety equipment and furniture. How can I help today?`,
        sender: 'bot',
        timestamp: new Date(),
        confidence: 1.0,
      };
      setMessages([welcomeMessage]);
      await saveMessage(welcomeMessage, sessionData.id);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to initialize chat session');
    }
  };

  const saveMessage = async (msg: ChatMessage, sessionDatabaseId: string) => {
    try {
      const { error } = await supabase.from('chat_messages').insert({
        session_id: sessionDatabaseId,
        message: msg.message,
        sender: msg.sender,
        confidence: msg.confidence || null,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const callAIChat = async (userMessage: string): Promise<ChatMessage> => {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message: userMessage,
        sessionId: session?.sessionId,
        contactId: session?.hubspotContactId,
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.message) throw new Error('Invalid response from AI chat');

    return {
      id: `bot_${Date.now()}`,
      message: data.message,
      sender: 'bot',
      timestamp: new Date(),
      confidence: data.confidence || 0.9,
    };
  };

  const handleEscalateToHuman = async (triggerText: string) => {
    if (!session || !session.databaseId) return;

    const escalationMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      message: `Got it — I'm connecting you with a team member. A specialist will be in touch shortly.\n\nFor immediate assistance, please email us at ${SUPPORT_EMAIL}. If you'd like a faster response, share your contact details below and we'll follow up directly.`,
      sender: 'bot',
      timestamp: new Date(),
      confidence: 1.0,
    };
    setMessages((prev) => [...prev, escalationMsg]);
    await saveMessage(escalationMsg, session.databaseId);

    setSession({ ...session, escalated: true });

    // Create a HubSpot ticket capturing the conversation so far
    try {
      const conversationSummary = [...messages, escalationMsg]
        .slice(-20)
        .map((m) => `${m.sender === 'user' ? 'Customer' : 'AI'}: ${m.message}`)
        .join('\n\n');

      await createTicket({
        sessionId: session.sessionId,
        contactId: session.hubspotContactId,
        subject: `Human handoff requested: ${triggerText.substring(0, 60)}`,
        content: `Customer requested to speak with a human.\n\nConversation:\n\n${conversationSummary}`,
        priority: 'HIGH',
      });
    } catch (err) {
      console.error('Failed to create escalation ticket:', err);
    }

    // Prompt for contact info if we don't have it yet
    if (!session.hubspotContactId) {
      setTimeout(() => setShowContactForm(true), 800);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? message).trim();
    if (!text || !session || !session.databaseId) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      message: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    await saveMessage(userMessage, session.databaseId);

    // Detect human-escalation intent before calling the AI
    if (isHumanEscalation(text)) {
      setIsTyping(false);
      await handleEscalateToHuman(text);
      return;
    }

    try {
      const aiResponse = await callAIChat(text);
      setMessages((prev) => [...prev, aiResponse]);
      await saveMessage(aiResponse, session.databaseId);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        message: `I'm having trouble responding right now. Please try again, or email us at ${SUPPORT_EMAIL}.`,
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.3,
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage, session.databaseId);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply === 'Talk to a Human') {
      // Send as a user message and trigger escalation
      handleSendMessage('Talk to a human');
    } else {
      handleSendMessage(reply);
    }
  };

  const handleContactSubmit = async () => {
    const sanitizedEmail = contactInfo.email?.trim().replace(/['"]/g, '');
    const sanitizedName = contactInfo.name?.trim();
    const sanitizedCompany = contactInfo.company?.trim();
    const sanitizedPhone = contactInfo.phone?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!sanitizedName || !sanitizedEmail) {
      toast.error('Please provide at least your name and email');
      return;
    }
    if (!emailRegex.test(sanitizedEmail)) {
      toast.error('Please provide a valid email address');
      return;
    }
    if (!session || !session.databaseId) {
      toast.error('Session not initialized');
      return;
    }

    try {
      const result = await createContact({
        sessionId: session.sessionId,
        email: sanitizedEmail,
        name: sanitizedName,
        company: sanitizedCompany,
        phone: sanitizedPhone,
      });

      if (result?.contactId) {
        setSession({ ...session, ...contactInfo, hubspotContactId: result.contactId });

        await supabase
          .from('chat_sessions')
          .update({
            email: sanitizedEmail,
            name: sanitizedName,
            company: sanitizedCompany,
            phone: sanitizedPhone,
            hubspot_contact_id: result.contactId,
          })
          .eq('id', session.databaseId);

        await syncConversation({ sessionId: session.sessionId, contactId: result.contactId });

        setShowContactForm(false);
        const confirmMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          message: `Thanks ${sanitizedName}! I've saved your details and our team will follow up shortly.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, confirmMessage]);
        await saveMessage(confirmMessage, session.databaseId);
        toast.success('Contact information saved');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to save contact information. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Button
            className="relative rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sea to-sea-dark hover:from-sea-dark hover:to-sea shadow-xl shadow-sea/30 border border-white/10 transition-transform duration-200 hover:scale-105"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI chat"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <Card
          className={`w-full sm:w-[400px] flex flex-col overflow-hidden shadow-2xl shadow-sea/20 border-sea/15 bg-white/95 backdrop-blur-xl rounded-2xl transition-[height] duration-300 ease-out ${
            isMinimized ? 'h-16' : 'h-[560px] max-h-[85vh]'
          }`}
        >
          <CardHeader className="p-3.5 bg-gradient-to-r from-sea to-sea-dark text-white flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <CardTitle className="text-sm font-semibold">Innosin Lab Assistant</CardTitle>
                <p className="text-[11px] opacity-80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online · usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/15 rounded-full" onClick={() => setIsMinimized(!isMinimized)} aria-label="Minimize">
                <Minimize2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/15 rounded-full" onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col flex-1 min-h-0 relative">
              {showContactForm && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-xl w-full max-w-sm shadow-2xl"
                  >
                    <h3 className="text-base font-semibold mb-1">Share your details</h3>
                    <p className="text-xs text-muted-foreground mb-4">A specialist will follow up shortly.</p>
                    <div className="space-y-2.5">
                      <Input placeholder="Your name *" value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} />
                      <Input placeholder="Email address *" type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                      <Input placeholder="Company" value={contactInfo.company} onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })} />
                      <Input placeholder="Phone number" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleContactSubmit} disabled={loading} className="flex-1 bg-sea hover:bg-sea-dark">
                        {loading ? 'Saving...' : 'Submit'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowContactForm(false)} className="flex-1">Cancel</Button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-sea-light/5 via-white to-sea-light/10 scroll-smooth">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white'
                            : 'bg-gradient-to-br from-sea to-sea-dark text-white'
                        }`}>
                          {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div
                          className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-br from-sea to-sea-dark text-white rounded-2xl rounded-br-md'
                              : 'bg-white text-foreground border border-sea/10 rounded-2xl rounded-bl-md'
                          }`}
                        >
                          <div className="whitespace-pre-line break-words">
                            {msg.sender === 'bot' ? renderMessageContent(msg.message) : msg.message}
                          </div>
                          <div className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sea to-sea-dark text-white flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-sea/10 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-sea/70 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-sea/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-1.5 h-1.5 bg-sea/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 border-t border-sea/10 bg-white/60 backdrop-blur-sm shrink-0">
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        className="text-xs px-3 py-1.5 rounded-full border border-sea/25 text-sea bg-white hover:bg-sea hover:text-white transition-colors duration-200 disabled:opacity-50"
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
              <div className="p-3 border-t border-sea/10 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about products, BSL labs, quotes…"
                    className="flex-1 text-sm rounded-full border-sea/20 focus-visible:ring-sea/30 bg-sea-light/10"
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                  />
                  <Button
                    size="icon"
                    className="rounded-full bg-gradient-to-br from-sea to-sea-dark hover:opacity-90 shadow-md shrink-0 h-10 w-10"
                    onClick={() => handleSendMessage()}
                    disabled={isTyping || !message.trim()}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedLiveChat;
