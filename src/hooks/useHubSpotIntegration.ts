
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HubSpotIntegrationData {
  sessionId: string;
  email?: string;
  name?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  dealName?: string;
  amount?: number;
  subject?: string;
  content?: string;
  contactId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const useHubSpotIntegration = () => {
  const [loading, setLoading] = useState(false);

  const createContact = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
        body: {
          action: 'create_contact',
          data: {
            sessionId: data.sessionId,
            email: data.email,
            name: data.name,
            company: data.company,
            jobTitle: data.jobTitle,
            phone: data.phone
          }
        }
      });

      if (error) throw error;
      
      toast.success('Contact created in HubSpot successfully');
      return result;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      toast.error('Failed to create contact in HubSpot');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
        body: {
          action: 'create_deal',
          data: {
            sessionId: data.sessionId,
            dealName: data.dealName,
            contactId: data.contactId,
            amount: data.amount
          }
        }
      });

      if (error) throw error;
      
      toast.success('Deal created in HubSpot successfully');
      return result;
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      toast.error('Failed to create deal in HubSpot');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
        body: {
          action: 'create_ticket',
          data: {
            sessionId: data.sessionId,
            subject: data.subject,
            content: data.content,
            contactId: data.contactId,
            priority: data.priority || 'MEDIUM'
          }
        }
      });

      if (error) throw error;
      
      toast.success('Support ticket created in HubSpot successfully');
      return result;
    } catch (error) {
      console.error('Error creating HubSpot ticket:', error);
      toast.error('Failed to create support ticket in HubSpot');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncConversation = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
        body: {
          action: 'sync_conversation',
          data: {
            sessionId: data.sessionId,
            contactId: data.contactId
          }
        }
      });

      if (error) throw error;
      
      toast.success('Conversation synced to HubSpot timeline');
      return result;
    } catch (error) {
      console.error('Error syncing conversation to HubSpot:', error);
      toast.error('Failed to sync conversation to HubSpot');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createContact,
    createDeal,
    createTicket,
    syncConversation,
    loading
  };
};
