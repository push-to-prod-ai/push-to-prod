"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function UserAuthButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <Button variant="ghost" size="sm" disabled>Loading...</Button>;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="default" size="sm">Sign In</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end text-sm">
        <span className="font-medium">{session.user?.name}</span>
        <Button 
          variant="link" 
          size="sm" 
          className="h-auto p-0 text-xs text-muted-foreground" 
          onClick={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? "Signing out..." : "Sign out"}
        </Button>
      </div>
      <Avatar className="h-8 w-8">
        {session.user?.image ? (
          <AvatarImage src={session.user.image} alt={session.user.name || ""} />
        ) : (
          <AvatarFallback>
            {session.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
} 