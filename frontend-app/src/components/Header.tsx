'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [imageError, setImageError] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold">Push to Prod</div>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <a 
                href="https://github.com/push-to-prod-ai/push-to-prod" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                Docs
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/push-to-prod-ai/push-to-prod/issues" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                Support
              </a>
            </li>
            {status === 'authenticated' && session?.user && (
              <>
                <li className="flex items-center">
                  <div className="flex items-center space-x-2">
                    {session.user.image && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || 'User'} 
                            fill
                            sizes="32px"
                            className="object-cover"
                            priority
                            onError={() => setImageError(true)}
                          />
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{session.user.name}</span>
                  </div>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Sign out
                  </button>
                </li>
              </>
            )}
            {status === 'unauthenticated' && (
              <li>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
} 