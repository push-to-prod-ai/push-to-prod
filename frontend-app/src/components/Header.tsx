'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// Create a type for external links
interface ExternalLink {
  label: string;
  url: string;
}

// Create a ProfileImage component to better organize the code
function ProfileImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-500">{alt.charAt(0)}</span>
      </div>
    );
  }
  
  return (
    <div className="relative w-8 h-8 rounded-full overflow-hidden">
      <Image 
        src={src} 
        alt={alt} 
        fill
        sizes="32px"
        className="object-cover"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  
  // Define external links for cleaner rendering
  const externalLinks: ExternalLink[] = [
    {
      label: 'Docs',
      url: 'https://github.com/push-to-prod-ai/push-to-prod'
    },
    {
      label: 'Support',
      url: 'https://github.com/push-to-prod-ai/push-to-prod/issues'
    }
  ];

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-xl font-bold">Push to Prod</div>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            {/* External links */}
            {externalLinks.map((link) => (
              <li key={link.label}>
                <a 
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
            
            {/* Auth-dependent content */}
            {isAuthenticated ? (
              <>
                <li className="flex items-center">
                  <div className="flex items-center space-x-2">
                    {session.user.image && (
                      <ProfileImage 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                      />
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
            ) : status === 'unauthenticated' && (
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