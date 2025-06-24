
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Bot, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  confidence?: number;
  isTyping?: boolean;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  email?: string;
  name?: string;
  company?: string;
  startTime: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  context: Record<string, any>;
}

const EnhancedLiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickResponses = [
    'Product information',
    'Request quote',
    'Technical support',
    'Installation services',
    'Pricing inquiry',
    'Speak to human agent'
  ];

  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = () => {
    const newSession: UserSession = {
      sessionId: `session_${Date.now()}`,
      startTime: new Date(),
      lastActivity: new Date(),
      messages: [],
      context: {}
    };
    
    setSession(newSession);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      message: 'Hello! I\'m your AI assistant for Innosin Lab. I can help you with product information, technical support, quotes, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
      confidence: 1.0
    };
    
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // This would be replaced with actual AI API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = {
      'product information': 'I can help you with information about our laboratory equipment and furniture. We offer emergency eyewash stations, fume cupboards, and more. What specific products are you interested in?',
      'request quote': 'I\'d be happy to help you with a quote. Could you please provide details about the products you\'re interested in and your project requirements?',
      'technical support': 'For technical support, I can help with installation guides, troubleshooting, and maintenance. What specific issue are you experiencing?',
      'installation services': 'We provide professional installation services for all our laboratory equipment. What products do you need installed?',
      'pricing inquiry': 'For pricing information, I\'ll need to know which products you\'re interested in. You can also request a detailed quote through our system.',
      'speak to human agent': 'I\'ll connect you with one of our human agents. Please hold on while I transfer you.'
    };
    
    let responseText = 'Thank you for your message. ';
    let confidence = 0.8;
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        responseText = response;
        confidence = 0.95;
        break;
      }
    }
    
    if (confidence < 0.9) {
      responseText += 'Our team specializes in laboratory equipment and can provide detailed information about our products and services. Is there something specific you\'d like to know about?';
    }
    
    return {
      id: `bot_${Date.now()}`,
      message: responseText,
      sender: 'bot',
      timestamp: new Date(),
      confidence
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      message: message.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    // Update session
    if (session) {
      setSession({
        ...session,
        lastActivity: new Date(),
        messages: [...session.messages, userMessage]
      });
    }
    
    try {
      // Check if user wants human agent
      if (message.toLowerCase().includes('human') || message.toLowerCase().includes('agent')) {
        setWaitingForAgent(true);
        const agentMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          message: 'I\'m connecting you with one of our human agents. They\'ll be with you shortly. In the meantime, feel free to describe your inquiry in detail.',
          sender: 'bot',
          timestamp: new Date(),
          confidence: 1.0
        };
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
        
        // Here you would integrate with HubSpot to create a ticket
        toast.success('Agent requested - creating support ticket');
        return;
      }
      
      const aiResponse = await simulateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      
      // Update session with bot response
      if (session) {
        setSession({
          ...session,
          lastActivity: new Date(),
          messages: [...session.messages, userMessage, aiResponse]
        });
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        message: 'I apologize, but I\'m having trouble processing your request right now. Let me connect you with a human agent.',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.5
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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
        <Badge className="absolute -top-2 -left-2 bg-green-500 text-white animate-pulse px-2 py-1">
          AI Live
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
              <CardTitle className="text-sm font-medium">AI Chat Support</CardTitle>
              <p className="text-xs opacity-90">
                {waitingForAgent ? 'Connecting to agent...' : 'Powered by AI'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs animate-pulse">
              {waitingForAgent ? 'Agent' : 'AI'}
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-sea-light/10">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%]`}>
                    {msg.sender !== 'user' && (
                      <div className="w-6 h-6 rounded-full bg-sea text-white flex items-center justify-center text-xs mt-1">
                        {msg.sender === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                        msg.sender === 'user'
                          ? 'bg-sea text-white shadow-md'
                          : 'bg-white/80 text-sea-dark border border-sea/20 backdrop-blur-sm'
                      }`}
                    >
                      <div>{msg.message}</div>
                      <div className={`text-xs mt-1 opacity-70 flex items-center ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-sea/70'
                      }`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.confidence && msg.confidence < 0.8 && (
                          <span className="ml-2 text-orange-500">• Low confidence</span>
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
                  placeholder="Type your message..."
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
