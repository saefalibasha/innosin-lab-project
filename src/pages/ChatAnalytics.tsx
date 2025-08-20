import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, User, Bot, Calendar, Mail, Building, Phone, Download } from 'lucide-react';

interface ChatSession {
  session_id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
  status: string;
  hubspot_contact_id: string | null;
  hubspot_ticket_id: string | null;
  messages: ChatMessage[];
}

interface ChatMessage {
  message: string;
  sender: string;
  created_at: string;
  confidence: number | null;
}

const ChatAnalytics = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChatData();
  }, []);

  const fetchChatData = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          session_id,
          name,
          email,
          company,
          phone,
          created_at,
          status,
          hubspot_contact_id,
          hubspot_ticket_id
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      // Fetch messages for each session
      const sessionsWithMessages = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('message, sender, created_at, confidence')
            .eq('session_id', session.session_id)
            .order('created_at', { ascending: true });

          if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return { ...session, messages: [] };
          }

          return {
            ...session,
            messages: (messagesData || []).map(msg => ({
              ...msg,
              sender: msg.sender as 'user' | 'bot'
            }))
          };
        })
      );

      setSessions(sessionsWithMessages);
    } catch (error) {
      console.error('Error fetching chat data:', error);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportChatData = (session: ChatSession) => {
    const chatData = {
      session_info: {
        session_id: session.session_id,
        name: session.name,
        email: session.email,
        company: session.company,
        phone: session.phone,
        created_at: session.created_at,
        status: session.status,
        hubspot_contact_id: session.hubspot_contact_id,
        hubspot_ticket_id: session.hubspot_ticket_id
      },
      conversation: session.messages.map(msg => ({
        timestamp: msg.created_at,
        sender: msg.sender,
        message: msg.message,
        confidence: msg.confidence
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${session.session_id}_${session.name || 'anonymous'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container-custom py-12 pt-20">
        <div className="text-center">Loading chat analytics...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-primary mb-4">Chat Analytics & Conversations</h1>
        <p className="text-muted-foreground">Track and analyze customer chat interactions and contact information.</p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by name, email, company, or session ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chat Sessions ({filteredSessions.length})</h2>
          {filteredSessions.map((session) => (
            <Card key={session.session_id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {session.name || 'Anonymous User'}
                  </CardTitle>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {session.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {session.email}
                    </div>
                  )}
                  {session.company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-3 h-3" />
                      {session.company}
                    </div>
                  )}
                  {session.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {session.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {session.messages.length} messages
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSession(
                        selectedSession === session.session_id ? null : session.session_id
                      )}
                    >
                      {selectedSession === session.session_id ? 'Hide' : 'View'} Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportChatData(session)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {session.hubspot_contact_id && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                    HubSpot Contact: {session.hubspot_contact_id}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Messages */}
        <div>
          {selectedSession ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Conversation Details</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3">
                {sessions
                  .find(s => s.session_id === selectedSession)
                  ?.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%]`}>
                        {msg.sender !== 'user' && (
                          <div className="w-6 h-6 rounded-full bg-sea text-white flex items-center justify-center text-xs mt-1">
                            <Bot className="w-3 h-3" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender === 'user'
                              ? 'bg-sea text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.message}</div>
                          <div className={`text-xs mt-1 opacity-70 ${
                            msg.sender === 'user' ? 'text-white/70' : 'text-gray/70'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                            {msg.confidence && ` • Confidence: ${(msg.confidence * 100).toFixed(0)}%`}
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
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a chat session to view the conversation</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;