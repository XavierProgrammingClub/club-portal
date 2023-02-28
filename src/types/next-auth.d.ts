// noinspection ES6UnusedImports,JSUnusedGlobalSymbols

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ObjectId } from "mongoose";
import NextAuth, { DefaultSession } from "next-auth";

import { IUser } from "@/models/user";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}
