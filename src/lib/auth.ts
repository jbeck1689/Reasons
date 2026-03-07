import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // If either field is missing, reject immediately
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Open the Users drawer and look for this email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // If no user found, or they have no password (OAuth-only account),
        // return null. Returning null tells NextAuth "invalid credentials"
        // without revealing whether the email exists.
        if (!user || !user.passwordHash) {
          return null;
        }

        // Compare the submitted password against the stored hash.
        // bcrypt.compare is deliberately slow (~250ms) — same as hashing.
        const passwordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        // Password is correct. Return the user object.
        // NextAuth passes this to the jwt callback above.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
