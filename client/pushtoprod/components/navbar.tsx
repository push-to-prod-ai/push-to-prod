"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  
  // Only show UI after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleThemeChange = (selectedTheme: "light" | "dark" | "system") => {
      setTheme(selectedTheme); 
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-2 flex items-center space-x-1">
          <img src="/penlogo.svg" alt="Logo" className="h-8 w-8" />
          <span className="hidden font-bold sm:inline-block">PushToProd.ai</span>
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/" className="w-full">
                  Photos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/pricing" className="w-full">
                  Pricing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/workspace" className="w-full">
                  Workspace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/contacts" className="w-full">
                  Contacts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/explore" className="w-full">
                  Explore
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/usecases" className="w-full">
                  Use Cases
                </Link>
              </DropdownMenuItem>
              {status === "authenticated" && (
                <DropdownMenuItem onSelect={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        <div className="mr-4 space-x-1 hidden lg:flex">   
          <nav className="flex items-center space-x-1 text-sm">
            <Link href="/pricing" className="hover:bg-secondary rounded-md p-2">Pricing</Link>
            <Link href="/settings" className="flex items-center space-x-1 hover:bg-secondary rounded-md p-2">
              <span className="">Settings</span>
              <span className="bg-primary text-white px-1 rounded-lg transition hidden lg:inline">
                Get Started
              </span>
            </Link>
            <Link href="/contacts" className="hover:bg-secondary rounded-md p-2">Contacts</Link>
            <Link href="/explore" className="hover:bg-secondary rounded-md p-2">Explore</Link>
            <Link href="/usecases" className="hover:bg-secondary rounded-md p-2">Use Cases</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center space-x-1 justify-end">
          {status === "authenticated" ? (
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme">
                {mounted ? (
                  theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Monitor className="h-5 w-5" />
                  )
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link 
            href="/profile" 
            className="block"
            aria-label="View Profile"
          >
            <Avatar className="border border-secondary">
              <AvatarImage
                alt={session?.user?.name || "User"}
                src={session?.user?.image || "https://ui.convertfa.st/avatars/avatar-1.svg"}
              />
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
