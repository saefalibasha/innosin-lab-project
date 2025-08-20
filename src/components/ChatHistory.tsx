import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, User, Bot, Calendar, Mail, Building, Phone, Download, ExternalLink, Ticket } from 'lucide-react';

interface ChatHistorySession {
  session_id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
  status: string;
  hubspot_contact_id: string | null;
  hubspot_ticket_id: string | null;
  message_count: number;
}

const ChatHistory = () => {
  const [sessions, setSessions] = useState<ChatHistorySession[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get message count for each session
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.session_id);

          return {
            ...session,
            message_count: count || 0
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (selectedSession === sessionId) {
      setSelectedSession(null);
      setMessages([]);
    } else {
      setSelectedSession(sessionId);
      fetchMessages(sessionId);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportSession = (session: ChatHistorySession) => {
    const exportData = {
      session_info: session,
      messages: messages,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
      <div className="container-custom py-8">
        <div className="text-center">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Chat History</h2>
        <p className="text-muted-foreground mb-4">View and manage all customer conversations</p>
        
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
          <h3 className="text-lg font-semibold">Chat Sessions ({filteredSessions.length})</h3>
          
          {filteredSessions.map((session) => (
            <Card 
              key={session.session_id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSession === session.session_id ? 'ring-2 ring-sea border-sea' : ''
              }`}
              onClick={() => handleSessionClick(session.session_id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {session.name || 'Anonymous User'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    {session.hubspot_ticket_id && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Ticket className="w-3 h-3 mr-1" />
                        Ticket
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
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

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {session.message_count} messages
                  </span>
                  <div className="flex gap-2">
                    {session.hubspot_contact_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://app.hubspot.com/contacts/your-hub-id/contact/${session.hubspot_contact_id}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        HubSpot
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSession(session);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <Card className="text-center py-8">
              <CardContent>
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No sessions match your search' : 'No chat sessions found'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messages View */}
        <div>
          {selectedSession ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map((msg, index) => (
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
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                          {msg.confidence && ` • ${(msg.confidence * 100).toFixed(0)}%`}
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
                
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Loading conversation...
                  </div>
                )}
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

export default ChatHistory;