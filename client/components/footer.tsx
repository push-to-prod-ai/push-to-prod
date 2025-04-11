'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Mail, Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSubscribed(true);
      setEmail('');
      toast.success("Subscription successful", {
        description: "Thank you for subscribing to our newsletter!"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error("Subscription failed", {
        description: err instanceof Error ? err.message : 'Failed to subscribe to newsletter'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap">
          {/* Company Info */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="font-semibold mb-3 text-sm">Company</h5>
            <nav className="flex flex-col md:items-start items-center text-sm mb-4 space-y-1">
              <Link href="/#features" className="hover:bg-secondary rounded-md p-1.5">
                Features
              </Link>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod/discussions" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                Contact
              </Link>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                GitHub
              </Link>
            </nav>
          </div>

          {/* Products */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="font-semibold mb-3 text-sm">Products</h5>
            <nav className="flex flex-col md:items-start items-center text-sm mb-4 space-y-1">
              <Link href="https://github.com/apps/pushtoprod-ai" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                PushToProd App
              </Link>
              <Link href="/#pricing" className="hover:bg-secondary rounded-md p-1.5">
                Pricing
              </Link>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod#readme" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                Documentation
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="font-semibold mb-3 text-sm">Support</h5>
            <nav className="flex flex-col md:items-start items-center text-sm mb-4 space-y-1">
              <Link href="https://github.com/push-to-prod-ai/push-to-prod/issues" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                Issues
              </Link>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                License
              </Link>
              <Link href="https://github.com/push-to-prod-ai/push-to-prod/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:bg-secondary rounded-md p-1.5">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="font-semibold mb-3 text-sm">Stay connected</h5>
            <div className="flex flex-col">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2 text-sm" 
                disabled={isLoading || isSubscribed}
                aria-invalid={error ? 'true' : 'false'}
              />
              {error && (
                <p className="text-destructive text-xs flex items-center mb-2">
                  <AlertCircle className="h-3 w-3 mr-1" /> {error}
                </p>
              )}
              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading || isSubscribed}
                variant={isSubscribed ? "secondary" : "default"}
                size="sm"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : isSubscribed ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center mt-6 space-x-4">
          <Link href="https://github.com/push-to-prod-ai" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">GitHub</span>
            <Github className="h-5 w-5" />
          </Link>
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="mailto:info@pushtoprod.ai" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">Email</span>
            <Mail className="h-5 w-5" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">© 2025 PushToProd.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
