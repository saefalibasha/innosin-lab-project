
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

// Request queue to manage API calls and prevent rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly delay = 250; // 250ms delay between requests to avoid rate limits

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request queue error:', error);
        }
        
        // Add delay between requests to prevent rate limiting
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }
    }
    
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Retry logic with exponential backoff for rate limited requests
const retryRequest = async <T>(
  request: () => Promise<T>, 
  maxRetries = 3, 
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error: any) {
      // Check if it's a rate limit error (429 or specific HubSpot rate limit message)
      const isRateLimit = error.message?.includes('rate limit') || 
                          error.message?.includes('429') ||
                          error.message?.includes('too many requests');
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

export const useHubSpotIntegration = () => {
  const [loading, setLoading] = useState(false);

  const createContact = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      console.log('Creating contact with data:', data);
      
      const result = await requestQueue.add(async () => {
        return retryRequest(async () => {
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

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(`Supabase function error: ${error.message}`);
          }
          
          if (!result?.success) {
            console.error('HubSpot integration failed:', result);
            throw new Error(result?.error || 'Failed to create contact in HubSpot');
          }
          
          return result;
        });
      });
      
      toast.success('Contact created in HubSpot successfully');
      return result;
    } catch (error: any) {
      console.error('Error creating HubSpot contact:', error);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast.error('HubSpot API rate limit reached. Please try again in a few minutes.');
      } else if (error.message?.includes('already exist')) {
        toast.warning('Contact already exists in HubSpot');
      } else {
        toast.error(`Failed to create contact in HubSpot: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const result = await requestQueue.add(async () => {
        return retryRequest(async () => {
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

          if (error) throw new Error(`Supabase function error: ${error.message}`);
          
          if (!result?.success) {
            throw new Error(result?.error || 'Failed to create deal in HubSpot');
          }
          
          return result;
        });
      });
      
      toast.success('Deal created in HubSpot successfully');
      return result;
    } catch (error: any) {
      console.error('Error creating HubSpot deal:', error);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast.error('HubSpot API rate limit reached. Please try again in a few minutes.');
      } else {
        toast.error(`Failed to create deal in HubSpot: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      const result = await requestQueue.add(async () => {
        return retryRequest(async () => {
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

          if (error) throw new Error(`Supabase function error: ${error.message}`);
          
          if (!result?.success) {
            throw new Error(result?.error || 'Failed to create ticket in HubSpot');
          }
          
          return result;
        });
      });
      
      toast.success('Support ticket created in HubSpot successfully');
      return result;
    } catch (error: any) {
      console.error('Error creating HubSpot ticket:', error);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast.error('HubSpot API rate limit reached. Please try again in a few minutes.');
      } else {
        toast.error(`Failed to create support ticket in HubSpot: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncConversation = async (data: HubSpotIntegrationData) => {
    setLoading(true);
    try {
      console.log('Syncing conversation for session:', data.sessionId, 'contact:', data.contactId);
      
      const result = await requestQueue.add(async () => {
        return retryRequest(async () => {
          const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
            body: {
              action: 'sync_conversation',
              data: {
                sessionId: data.sessionId,
                contactId: data.contactId
              }
            }
          });

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(`Supabase function error: ${error.message}`);
          }
          
          if (!result?.success) {
            console.error('Conversation sync failed:', result);
            throw new Error(result?.error || 'Failed to sync conversation to HubSpot');
          }
          
          return result;
        });
      });
      
      toast.success('Conversation synced to HubSpot timeline');
      return result;
    } catch (error: any) {
      console.error('Error syncing conversation to HubSpot:', error);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast.error('HubSpot API rate limit reached. Please try again in a few minutes.');
      } else {
        toast.error(`Failed to sync conversation to HubSpot: ${error.message}`);
      }
      
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
