import mongoose from "mongoose";

import { IClub } from "@/models/club";
import { IUser } from "@/models/user";

export interface IBlog {
  _id: string;
  title: string;
  content: string;
  author: {
    user: string | IUser;
    club: string | IClub;
  };
  status: "public" | "internal" | "draft";
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      user: { ref: "User", required: true },
      club: { ref: "Club", required: true },
    },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: ["public", "internal", "draft"],
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;
