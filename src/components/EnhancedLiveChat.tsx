import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Bot, User, Clock } from 'lucide-react';
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
  databaseId?: string; // The UUID from the database
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

  const quickResponses = [
    'Product catalog & specifications',
    'Request detailed quote',
    'Technical support & troubleshooting',
    'Professional installation services',
    'Pricing & financing options',
    'Warranty & maintenance',
    'Custom laboratory design',
    'Compliance & certifications'
  ];

  // Enhanced knowledge base for more comprehensive responses
  const knowledgeBase = {
    products: {
      'eyewash': {
        keywords: ['eyewash', 'eye wash', 'emergency', 'safety shower', 'bl-hes', 'bl-ebs'],
        response: 'Our emergency eyewash stations include bench-mounted (BL-HES-BENCH-001), wall-mounted (BL-HES-WALL-002), and recessed models (BL-EBS-RECESSED-003). They meet ANSI Z358.1 standards and provide 15 minutes of continuous flow. Would you like specific technical specifications, installation requirements, or pricing information?'
      },
      'fume': {
        keywords: ['fume', 'hood', 'cupboard', 'ventilation', 'extraction'],
        response: 'Our fume cupboards offer superior containment and energy efficiency. We have various models including walk-in fume hoods, bench-top units, and specialized chemistry fume cupboards. Key features include variable air volume controls, safety monitoring systems, and ASHRAE 110 compliance. What type of laboratory work will you be conducting?'
      },
      'safety': {
        keywords: ['safety', 'shower', 'emergency', 'decontamination', 'bl-bs'],
        response: 'Our safety shower systems (BL-BS-WALL-006) provide full-body emergency decontamination with ANSI Z358.1 compliance. Features include thermostatic mixing valves, high-visibility signage, and corrosion-resistant construction. Would you like information about installation requirements, maintenance procedures, or compliance documentation?'
      },
      'furniture': {
        keywords: ['furniture', 'bench', 'cabinet', 'storage', 'lab furniture'],
        response: 'Our laboratory furniture includes modular benching systems, chemical storage cabinets, mobile carts, and specialized workstations. All furniture meets laboratory safety standards with chemical-resistant surfaces and ergonomic design. What type of laboratory setup are you planning?'
      }
    },
    services: {
      'installation': {
        keywords: ['install', 'installation', 'setup', 'commissioning'],
        response: 'We provide comprehensive installation services including site surveys, project management, certified installation by trained technicians, testing and commissioning, and staff training. Our installation team ensures compliance with all safety standards and local regulations. Would you like to schedule a site survey or discuss project timeline?'
      },
      'maintenance': {
        keywords: ['maintenance', 'service', 'repair', 'calibration'],
        response: 'Our maintenance services include preventive maintenance programs, emergency repairs, calibration services, and compliance testing. We offer annual service contracts with priority response times and genuine parts guarantee. What equipment do you need serviced?'
      },
      'design': {
        keywords: ['design', 'planning', 'layout', 'consultation'],
        response: 'Our laboratory design team provides comprehensive planning services including workflow analysis, space optimization, utility planning, and regulatory compliance consulting. We use 3D modeling and can provide virtual walkthroughs. Are you planning a new laboratory or renovating an existing facility?'
      }
    },
    compliance: {
      'standards': {
        keywords: ['standard', 'compliance', 'regulation', 'ansi', 'osha', 'certification'],
        response: 'Our products comply with major safety standards including ANSI Z358.1 for emergency equipment, ASHRAE 110 for fume hoods, OSHA regulations, and local building codes. We provide all necessary documentation and certificates. Which specific compliance requirements do you need to meet?'
      }
    }
  };

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
      // Get current user (null for anonymous)
      const { data: user } = await supabase.auth.getUser();
      
      // Create session in database first
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          user_id: user?.user?.id || null, // Allow null for anonymous users
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
      
      // Enhanced welcome message with more comprehensive introduction
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: `Hello! I'm your AI assistant for Innosin Lab, your trusted partner in laboratory safety and equipment solutions. I can help you with:

• Product information & technical specifications
• Custom quotes & pricing
• Installation & maintenance services  
• Safety compliance & certifications
• Laboratory design & planning consultation
• Technical support & troubleshooting

I have extensive knowledge about our emergency eyewash stations, fume cupboards, safety showers, and laboratory furniture. How can I assist you today?`,
        sender: 'bot',
        timestamp: new Date(),
        confidence: 1.0
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

  const findBestResponse = (userMessage: string): { response: string; confidence: number } => {
    const lowerMessage = userMessage.toLowerCase();
    let bestMatch = { response: '', confidence: 0.3 };

    // Check all knowledge base categories
    Object.values(knowledgeBase).forEach(category => {
      Object.values(category).forEach(item => {
        const matchCount = item.keywords.filter(keyword => 
          lowerMessage.includes(keyword.toLowerCase())
        ).length;
        
        if (matchCount > 0) {
          const confidence = Math.min(0.95, 0.6 + (matchCount * 0.15));
          if (confidence > bestMatch.confidence) {
            bestMatch = { response: item.response, confidence };
          }
        }
      });
    });

    // Enhanced fallback responses based on intent
    if (bestMatch.confidence < 0.5) {
      if (lowerMessage.includes('help') || lowerMessage.includes('assistance')) {
        bestMatch = {
          response: 'I\'m here to help! I can provide detailed information about our laboratory equipment, safety systems, installation services, maintenance programs, and compliance requirements. What specific area would you like to explore?',
          confidence: 0.7
        };
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
        bestMatch = {
          response: 'I\'d be happy to help you with pricing information. To provide accurate quotes, I\'ll need to understand your specific requirements including product types, quantities, installation needs, and timeline. Could you please share more details about your project?',
          confidence: 0.8
        };
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('speak') || lowerMessage.includes('call')) {
        bestMatch = {
          response: 'I can connect you with our expert team! Please share your contact information so our specialists can reach out to discuss your specific laboratory needs and provide personalized assistance.',
          confidence: 0.75
        };
      } else {
        bestMatch = {
          response: 'Thank you for your question. As a laboratory equipment specialist, I can provide detailed information about emergency eyewash stations, fume cupboards, safety showers, laboratory furniture, installation services, and compliance requirements. Could you please tell me more about what you\'re looking for?',
          confidence: 0.4
        };
      }
    }

    return bestMatch;
  };

  const simulateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    try {
      // First try the OpenAI-powered chat
      console.log('Calling AI chat function with message:', userMessage);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          sessionId: session?.sessionId,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) {
        console.error('AI chat function error:', error);
        throw new Error(error.message);
      }

      if (data?.success && data?.message) {
        console.log('AI response received:', data.message);
        return {
          id: `bot_${Date.now()}`,
          message: data.message,
          sender: 'bot',
          timestamp: new Date(),
          confidence: data.confidence || 0.9
        };
      } else {
        throw new Error('Invalid response from AI chat function');
      }
    } catch (error) {
      console.error('AI chat error, falling back to rule-based:', error);
      
      // Fallback to rule-based responses if OpenAI fails
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { response: responseText, confidence } = findBestResponse(userMessage);
      
      // Check if user is asking for quote or sales related info and no contact info exists
      const lowerMessage = userMessage.toLowerCase();
      let finalResponse = responseText;
      
      if ((lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('purchase')) && !session?.hubspotContactId) {
        finalResponse += '\n\nTo provide you with accurate pricing and personalized service, I\'d like to collect your contact information. Would you like to share your details so our team can assist you better?';
        setTimeout(() => setShowContactForm(true), 2000);
      }
      
      return {
        id: `bot_${Date.now()}`,
        message: finalResponse,
        sender: 'bot',
        timestamp: new Date(),
        confidence
      };
    }
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
    
    // Save user message
    await saveMessage(userMessage, session.databaseId);
    
    // Update session
    setSession({
      ...session,
      lastActivity: new Date(),
      messages: [...session.messages, userMessage]
    });
    
    try {
      const aiResponse = await simulateAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response
      await saveMessage(aiResponse, session.databaseId);
      
      // Update session with bot response
      setSession({
        ...session,
        lastActivity: new Date(),
        messages: [...session.messages, userMessage, aiResponse]
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        message: 'I apologize, but I\'m having trouble processing your request right now. Please try again, or feel free to ask about our laboratory equipment, safety systems, or services.',
        sender: 'bot',
        timestamp: new Date(),
        confidence: 0.5
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
      
      // Create HubSpot contact
      const result = await createContact({
        sessionId: session.sessionId,
        email: contactInfo.email,
        name: contactInfo.name,
        company: contactInfo.company,
        phone: contactInfo.phone
      });

      if (result?.contactId) {
        // Update session with contact info and HubSpot ID
        const updatedSession = {
          ...session,
          ...contactInfo,
          hubspotContactId: result.contactId
        };
        setSession(updatedSession);

        // Update database
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

        // Sync conversation to HubSpot
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
          timestamp: new Date()
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
              <p className="text-xs opacity-90">Innosin Lab Expert Support</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
              Online
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
                      <div className={`text-xs mt-1 opacity-70 flex items-center ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-sea/70'
                      }`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
