import NextAuth from "next-auth";
import { authOptions } from "@/5_shared/auth/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

