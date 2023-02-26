import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { GetServerSidePropsContext } from "next";
import NextAuth, { getServerSession, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import User from "@/models/user";
import { connectDatabase } from "@/utils/db";
import { env } from "@/utils/env";

const userSchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string(),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "John Smith" },
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        connectDatabase().catch(() => {
          return {
            error: "Database connection failed",
          };
        });

        credentials = userSchema.parse(credentials);

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user Found with Email Please Sign Up...!");
        }

        const isPasswordCorrect = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect || user.email !== credentials.email) {
          throw new Error("Username or Password doesn't match");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  secret: env.JWT_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
    encode: async ({ secret, token }) => {
      return sign(token as object, secret);
    },
    decode: async ({ secret, token }) => {
      return verify(token as string, secret) as JWT;
    },
  },
};

export default NextAuth(authOptions);

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
