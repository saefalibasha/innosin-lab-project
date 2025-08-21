
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <Mail className="w-16 h-16 mx-auto text-sea mb-6" />
        <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4 tracking-tight">
          Stay Updated with Lab Innovations
        </h3>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get the latest insights on laboratory design, equipment updates, safety regulations, 
          and industry trends delivered to your inbox monthly.
        </p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
        <CardContent className="p-12">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 text-lg rounded-xl border-2 focus:border-sea transition-all duration-300"
                required
              />
            </div>
            
            <div>
              <Input
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 text-lg rounded-xl border-2 focus:border-sea transition-all duration-300"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-105 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              By subscribing, you agree to receive marketing emails from Innosin Lab. 
              You can unsubscribe at any time. We respect your privacy.
            </p>
          </form>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="font-bold text-sea text-lg mb-2">Monthly Updates</div>
              <div className="text-muted-foreground">Industry insights</div>
            </div>
            <div className="animate-fade-in">
              <div className="font-bold text-sea text-lg mb-2">New Products</div>
              <div className="text-muted-foreground">Latest equipment</div>
            </div>
            <div className="animate-fade-in">
              <div className="font-bold text-sea text-lg mb-2">Case Studies</div>
              <div className="text-muted-foreground">Project highlights</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterSubscription;
