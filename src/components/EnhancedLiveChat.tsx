
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Bot, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { useDynamicKnowledgeBase } from '@/hooks/useDynamicKnowledgeBase';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  confidence?: number;
  source?: string;
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
}

const EnhancedLiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { createContact, syncConversation, loading } = useHubSpotIntegration();
  const { findBestResponse, getProductSpecifications, loading: knowledgeLoading } = useDynamicKnowledgeBase();

  const quickResponses = [
    'Broen-Lab emergency showers',
    'Oriental Giken fume hoods',
    'Hamilton laboratory furniture', 
    'Product specifications',
    'Installation services',
    'Request detailed quote',
    'Technical support',
    'Compliance certifications'
  ];

  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    const sessionId = `session_${Date.now()}`;
    
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          start_time: new Date().toISOString(),
          status: 'active'
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
        messages: []
      };
      
      setSession(newSession);
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: `Hello! I'm your AI assistant for Innosin Lab, powered by our comprehensive product catalogs. I have detailed knowledge from our brand-specific documentation including:

• **Broen-Lab**: Emergency showers, water faucets, and safety equipment
• **Oriental Giken**: Advanced fume hood systems (Type 1 & Type 2)
• **Hamilton Laboratory**: Professional laboratory furniture and storage
• **Innosin Lab**: Complete laboratory solutions catalog

I can provide specific product information, technical specifications, installation guidance, compliance details, and help with product selection. My knowledge is continuously updated from our latest PDF catalogs.

How can I assist you with your laboratory equipment needs today?`,
        sender: 'bot',
        timestamp: new Date(),
        confidence: 1.0,
        source: 'Dynamic Knowledge Base'
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
      console.log('Saving message:', { msg, sessionDatabaseId });
      
      const { error } = await supabase.from('chat_messages').insert({
        session_id: sessionDatabaseId,
        message: msg.message,
        sender: msg.sender,
        confidence: msg.confidence || null
      });

      if (error) {
        console.error('Error saving message:', error);
        throw error;
      }
      
      console.log('Message saved successfully');
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use dynamic knowledge base for response
    const { response: responseText, confidence, source = 'AI Assistant' } = await findBestResponse(userMessage);
    
    const lowerMessage = userMessage.toLowerCase();
    let finalResponse = responseText;
    
    // Check if user is asking for specifications and try to get them
    if (lowerMessage.includes('spec') || lowerMessage.includes('technical')) {
      const specs = await getProductSpecifications(userMessage);
      if (specs.length > 0) {
        finalResponse += '\n\n**Key Specifications:**\n';
        specs.slice(0, 3).forEach(spec => {
          finalResponse += `• ${spec.specification_name}: ${spec.specification_value}${spec.unit ? ' ' + spec.unit : ''}\n`;
        });
      }
    }
    
    // Trigger contact form for quotes/pricing
    if ((lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('purchase')) && !session?.hubspotContactId) {
      finalResponse += '\n\nTo provide you with accurate pricing and personalized service, I\'d like to collect your contact information. Would you like to share your details so our team can assist you better?';
      setTimeout(() => setShowContactForm(true), 2000);
    }
    
    return {
      id: `bot_${Date.now()}`,
      message: finalResponse,
      sender: 'bot',
      timestamp: new Date(),
      confidence,
      source
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session || !session.databaseId) return;
    
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      message: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    await saveMessage(userMessage, session.databaseId);
    
    setSession({
      ...session,
      lastActivity: new Date(),
      messages: [...session.messages, userMessage]
    });
    
    try {
      const aiResponse = await simulateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      
      await saveMessage(aiResponse, session.databaseId);
      
      setSession({
        ...session,
        lastActivity: new Date(),
        messages: [...session.messages, userMessage, aiResponse]
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        message: 'I apologize, but I\'m having trouble accessing our product knowledge base right now. Please try again, or ask about our Broen-Lab, Oriental Giken, Hamilton Laboratory, or Innosin Lab products.',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.5,
        source: 'Error Handler'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (session.databaseId) {
        await saveMessage(errorMessage, session.databaseId);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleContactSubmit = async () => {
    if (!contactInfo.email || !contactInfo.name || !session || !session.databaseId) {
      toast.error('Please fill in at least name and email');
      return;
    }

    try {
      console.log('Creating contact with session ID:', session.sessionId);
      
      const result = await createContact({
        sessionId: session.sessionId,
        email: contactInfo.email,
        name: contactInfo.name,
        company: contactInfo.company,
        phone: contactInfo.phone
      });

      if (result?.contactId) {
        const updatedSession = {
          ...session,
          ...contactInfo,
          hubspotContactId: result.contactId
        };
        setSession(updatedSession);

        await supabase
          .from('chat_sessions')
          .update({
            email: contactInfo.email,
            name: contactInfo.name,
            company: contactInfo.company,
            phone: contactInfo.phone,
            hubspot_contact_id: result.contactId
          })
          .eq('id', session.databaseId);

        console.log('Syncing conversation for session:', session.sessionId, 'contact:', result.contactId);
        await syncConversation({
          sessionId: session.sessionId,
          contactId: result.contactId
        });

        setShowContactForm(false);
        
        const confirmMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          message: `Thank you ${contactInfo.name}! I've saved your contact information and our conversation has been logged to our CRM system. Our team will now be able to provide you with personalized assistance and follow up on your laboratory equipment needs. How can I help you further today?`,
          sender: 'bot',
          timestamp: new Date(),
          source: 'Contact Management'
        };
        
        setMessages(prev => [...prev, confirmMessage]);
        await saveMessage(confirmMessage, session.databaseId);
        
        toast.success('Contact information saved and synced successfully!');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to save contact information. Please try again.');
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-16 h-16 bg-sea hover:bg-sea-dark shadow-xl border-2 border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </Button>
        <Badge className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white animate-pulse px-2 py-1 whitespace-nowrap">
          AI Chat
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-[600px]'} shadow-2xl transition-all glass-card border-sea/20`}>
        <CardHeader className="p-4 bg-gradient-to-r from-sea to-sea-dark text-white rounded-t-lg flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <div>
              <CardTitle className="text-sm font-medium">AI Chat</CardTitle>
              <p className="text-xs opacity-90">Dynamic Catalog Expert</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
              {knowledgeLoading ? 'Loading' : 'Online'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[536px]">
            {/* Contact Form Modal */}
            {showContactForm && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="bg-white p-6 rounded-lg m-4 w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <p className="text-sm text-gray-600 mb-4">Help us provide you with personalized assistance and accurate pricing.</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Your name *"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                    />
                    <Input
                      placeholder="Email address *"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    />
                    <Input
                      placeholder="Company"
                      value={contactInfo.company}
                      onChange={(e) => setContactInfo({...contactInfo, company: e.target.value})}
                    />
                    <Input
                      placeholder="Phone number"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      onClick={handleContactSubmit} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Saving...' : 'Submit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowContactForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-sea-light/10">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%]`}>
                    {msg.sender !== 'user' && (
                      <div className="w-6 h-6 rounded-full bg-sea text-white flex items-center justify-center text-xs mt-1">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                        msg.sender === 'user'
                          ? 'bg-sea text-white shadow-md'
                          : 'bg-white/80 text-sea-dark border border-sea/20 backdrop-blur-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.message}</div>
                      <div className={`text-xs mt-1 opacity-70 flex items-center justify-between ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-sea/70'
                      }`}>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {msg.source && msg.sender === 'bot' && (
                          <div className="text-xs opacity-60">
                            {msg.source}
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs mt-1">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-sea text-white flex items-center justify-center text-xs">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg border border-sea/20">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-sea/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-sea/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-sea/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Responses */}
            <div className="p-3 border-t border-sea/20 bg-white/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-1 mb-3">
                {quickResponses.map(response => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 border-sea/30 text-sea hover:bg-sea hover:text-white transition-all duration-300"
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-sea/20 bg-white/80 backdrop-blur-sm">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about our catalog products..."
                  className="flex-1 text-sm border-sea/30 focus:border-sea"
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <Button
                  size="sm"
                  className="bg-sea hover:bg-sea-dark transition-all duration-300"
                  onClick={handleSendMessage}
                  disabled={isTyping || !message.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default EnhancedLiveChat;
