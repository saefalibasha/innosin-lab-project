import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Mail, Phone, ArrowRight } from 'lucide-react';

const QuoteReceived = () => {
  return (
    <>
      <Helmet>
        <title>Request Received | Innosin Lab Singapore</title>
        <meta
          name="description"
          content="Thank you for your quote request. The Innosin Lab team will respond within one business day."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.innosinlab.com/quote-received" />
      </Helmet>

      <main className="min-h-[70vh] bg-gradient-to-b from-background to-sea/5 py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sea/10">
                <CheckCircle2 className="h-8 w-8 text-sea" aria-hidden="true" />
              </div>

              <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Request received
              </h1>

              <p className="mb-8 text-muted-foreground">
                Thank you for reaching out to Innosin Lab. Our Singapore team has your
                details and will reply with a quotation within one business day.
              </p>

              <div className="mb-8 space-y-3 text-left">
                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <Phone className="h-5 w-5 shrink-0 text-sea" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Need it sooner?</p>
                    <a href="tel:+6569934996" className="font-medium text-foreground hover:underline">
                      +65 6993 4996
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <Mail className="h-5 w-5 shrink-0 text-sea" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email us directly</p>
                    <a
                      href="mailto:enquiry@innosinlab.com"
                      className="font-medium text-foreground hover:underline"
                    >
                      enquiry@innosinlab.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/products">
                    Browse products <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/home">Back to home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default QuoteReceived;
