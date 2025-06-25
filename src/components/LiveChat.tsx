
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! Welcome to Innosin Lab. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const quickResponses = [
    'Product information',
    'Request quote',
    'Technical support',
    'Installation services'
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: message.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: 'Thank you for your message. Our team will get back to you shortly. In the meantime, you can browse our products or use our floor planner tool.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-14 h-14 bg-sea hover:bg-sea-dark shadow-xl border-2 border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
        <Badge className="absolute -top-2 -left-2 bg-green-500 text-white animate-pulse">
          Live
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 ${isMinimized ? 'h-16' : 'h-96'} shadow-2xl transition-all glass-card border-sea/20`}>
        <CardHeader className="p-4 bg-gradient-to-r from-sea to-sea-dark text-white rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Chat Support</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs animate-pulse">
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
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-sea-light/10">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm transition-all duration-300 ${
                      msg.sender === 'user'
                        ? 'bg-sea text-white shadow-md'
                        : 'bg-white/80 text-sea-dark border border-sea/20 backdrop-blur-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Responses */}
            <div className="p-2 border-t border-sea/20 bg-white/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-1 mb-2">
                {quickResponses.map(response => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 border-sea/30 text-sea hover:bg-sea hover:text-white transition-all duration-300"
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="sm"
                  className="bg-sea hover:bg-sea-dark transition-all duration-300"
                  onClick={handleSendMessage}
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

export default LiveChat;
