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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap">
          {/* Company Info */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="uppercase mb-6 font-bold">Company</h5>
            <ul className="mb-4">
              <li className="mt-2">
                <Link href="/#features" className="hover:underline text-gray-600 hover:text-gray-800">
                  Features
                </Link>
              </li>
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod/discussions" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  Contact
                </Link>
              </li>
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="uppercase mb-6 font-bold">Products</h5>
            <ul className="mb-4">
              <li className="mt-2">
                <Link href="https://github.com/apps/pushtoprod-ai" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  PushToProd App
                </Link>
              </li>
              <li className="mt-2">
                <Link href="/#pricing" className="hover:underline text-gray-600 hover:text-gray-800">
                  Pricing
                </Link>
              </li>
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod#readme" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="uppercase mb-6 font-bold">Support</h5>
            <ul className="mb-4">
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod/issues" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  Issues
                </Link>
              </li>
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  License
                </Link>
              </li>
              <li className="mt-2">
                <Link href="https://github.com/push-to-prod-ai/push-to-prod/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 hover:text-gray-800">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="w-full md:w-1/4 text-center md:text-left">
            <h5 className="uppercase mb-6 font-bold">Stay connected</h5>
            <div className="flex flex-col">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2" 
                disabled={isLoading || isSubscribed}
                aria-invalid={error ? 'true' : 'false'}
              />
              {error && (
                <p className="text-destructive text-sm flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" /> {error}
                </p>
              )}
              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading || isSubscribed}
                variant={isSubscribed ? "secondary" : "default"}
                size="lg"
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
        <div className="flex justify-center mt-8 space-x-6">
          <Link href="https://github.com/push-to-prod-ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" />
          </Link>
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" />
          </Link>
          <Link href="mailto:info@pushtoprod.ai" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Email</span>
            <Mail className="h-6 w-6" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-base text-gray-400">© 2025 PushToProd.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
