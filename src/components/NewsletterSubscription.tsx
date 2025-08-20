
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { createContact } = useHubSpotIntegration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Generate session ID for tracking
      const sessionId = `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in Supabase
      const { error: supabaseError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          name,
          email,
          status: 'newsletter_subscribed',
          context: {
            source: 'newsletter_subscription',
            subscription_type: 'newsletter'
          }
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Create HubSpot contact with newsletter preference
      await createContact({
        sessionId,
        name,
        email
      });

      setIsSubscribed(true);
      toast.success('Successfully subscribed to our newsletter!');
      
      // Reset form
      setTimeout(() => {
        setEmail('');
        setName('');
        setIsSubscribed(false);
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Welcome to Our Newsletter!
          </h3>
          <p className="text-green-700">
            Thank you for subscribing. You'll receive the latest updates on laboratory innovations and industry insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-sea/10 to-sea/20 border-sea/30">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 mx-auto text-sea mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Stay Updated with Lab Innovations
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Get the latest insights on laboratory design, equipment updates, safety regulations, 
            and industry trends delivered to your inbox monthly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Input
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-sea hover:bg-sea-dark"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to receive marketing emails from Innosin Lab. 
            You can unsubscribe at any time. We respect your privacy.
          </p>
        </form>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
          <div>
            <div className="font-semibold text-sea">Monthly Updates</div>
            <div>Industry insights</div>
          </div>
          <div>
            <div className="font-semibold text-sea">New Products</div>
            <div>Latest equipment</div>
          </div>
          <div>
            <div className="font-semibold text-sea">Case Studies</div>
            <div>Project highlights</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterSubscription;
