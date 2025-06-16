
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
          className="rounded-full w-14 h-14 bg-black hover:bg-gray-800 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
        <Badge className="absolute -top-2 -left-2 bg-red-500">
          Live
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 ${isMinimized ? 'h-16' : 'h-96'} shadow-xl transition-all`}>
        <CardHeader className="p-4 bg-black text-white rounded-t-lg flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Chat Support</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
              Online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-gray-700"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Responses */}
            <div className="p-2 border-t">
              <div className="flex flex-wrap gap-1 mb-2">
                {quickResponses.map(response => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => handleQuickResponse(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  size="sm"
                  className="bg-black hover:bg-gray-800"
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
