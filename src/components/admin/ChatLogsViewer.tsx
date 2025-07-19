
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Download, Calendar, User, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  session_id: string;
  name?: string;
  email?: string;
  company?: string;
  status: string;
  created_at: string;
  end_time?: string;
  satisfaction_score?: number;
  hubspot_contact_id?: string;
  hubspot_deal_id?: string;
  message_count?: number;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  created_at: string;
  confidence?: number;
}

export const ChatLogsViewer: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [searchTerm, sessions]);

  const fetchChatSessions = async () => {
    try {
      // Fetch sessions with message counts
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          session_id,
          name,
          email,
          company,
          status,
          created_at,
          end_time,
          satisfaction_score,
          hubspot_contact_id,
          hubspot_deal_id
        `)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get message counts for each session
      const sessionsWithCounts = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          
          return { ...session, message_count: count || 0 };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    if (!searchTerm.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const filtered = sessions.filter(session =>
      session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.session_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSessions(filtered);
  };

  const fetchChatMessages = async (sessionId: string) => {
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, message, sender, created_at, confidence')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const viewSession = async (session: ChatSession) => {
    setSelectedSession(session);
    await fetchChatMessages(session.id);
  };

  const exportSession = (session: ChatSession) => {
    // TODO: Implement export functionality
    console.log('Exporting session:', session.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'abandoned':
        return <Badge className="bg-yellow-100 text-yellow-800">Abandoned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat Sessions</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or session ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading chat sessions...</div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(session.status)}
                      {session.hubspot_contact_id && (
                        <Badge variant="outline" className="text-orange-600">
                          HubSpot Synced
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{session.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{session.company || 'No company'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(session.created_at), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Session ID: {session.session_id} • Messages: {session.message_count}
                      {session.satisfaction_score && (
                        <span> • Rating: {session.satisfaction_score}⭐</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewSession(session)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>
                            Chat Session: {selectedSession?.name || 'Anonymous'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {selectedSession && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                              <div>
                                <strong>Session ID:</strong> {selectedSession.session_id}
                              </div>
                              <div>
                                <strong>Status:</strong> {selectedSession.status}
                              </div>
                              <div>
                                <strong>Email:</strong> {selectedSession.email || 'Not provided'}
                              </div>
                              <div>
                                <strong>Company:</strong> {selectedSession.company || 'Not provided'}
                              </div>
                              <div>
                                <strong>Started:</strong> {format(new Date(selectedSession.created_at), 'MMM dd, yyyy HH:mm')}
                              </div>
                              <div>
                                <strong>Messages:</strong> {selectedSession.message_count}
                              </div>
                            </div>
                          )}
                          <ScrollArea className="h-96 w-full border rounded-lg p-4">
                            {messagesLoading ? (
                              <div className="text-center py-8">Loading messages...</div>
                            ) : (
                              <div className="space-y-4">
                                {messages.map((message) => (
                                  <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div
                                      className={`max-w-[70%] p-3 rounded-lg ${
                                        message.sender === 'user'
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-200 text-gray-900'
                                      }`}
                                    >
                                      <div className="text-sm">{message.message}</div>
                                      <div className="text-xs mt-1 opacity-70">
                                        {format(new Date(message.created_at), 'HH:mm')}
                                        {message.confidence && message.sender === 'assistant' && (
                                          <span className="ml-2">({Math.round(message.confidence * 100)}%)</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportSession(session)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
              {filteredSessions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No chat sessions found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
