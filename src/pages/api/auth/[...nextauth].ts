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

export const loginSchema = z.object({
  password: z.string(),
  email: z.string(),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
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
            status: "ERROR",
            message: "Internal Server Error",
          };
        });

        credentials = loginSchema.parse(credentials);

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("User not found");
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
    session({ session, token }) {
      return {
        ...session,
        user: {
          name: session.user.name as string,
          email: session.user.email as string,
          id: token.sub as string,
        },
      };
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
