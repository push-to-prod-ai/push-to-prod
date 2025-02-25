'use client';

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <button
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className="bg-black text-white px-6 py-3 rounded-md"
      >
        Sign in with GitHub
      </button>
    </div>
  );
} 