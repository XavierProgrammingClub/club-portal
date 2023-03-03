import { compare } from "bcryptjs";
import { GetServerSidePropsContext } from "next";
import NextAuth, { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import User, { IUser } from "@/models/user";
import { connectDatabase } from "@/utils/db";
import { env } from "@/utils/env";
import { loginSchema } from "@/validators";

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
      session.user.id = token.sub as string;
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
  },
};

export default NextAuth(authOptions);

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

export const getCurrentUserDetails = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerAuthSession(ctx);
  if (!session) throw new Error("User not logged in!");

  const user = (await User.findById(session.user.id).select(
    "-password"
  )) as IUser;
  return user;
};
