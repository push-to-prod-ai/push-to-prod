import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Use the authOptions object to create the NextAuth handler
const handler = NextAuth(authOptions);

// Only export the handler functions
export { handler as GET, handler as POST }; 