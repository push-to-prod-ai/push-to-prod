import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

// Helper function for getting auth session on the server side
export const getAuth = async () => {
  return await getServerSession(authOptions);
}; 