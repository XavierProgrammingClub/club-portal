import mongoose from "mongoose";

import { IClub } from "@/models/club";
import { IUser } from "@/models/user";

export interface IBlog {
  _id: string;
  featuredImage: string;
  title: string;
  content: string;
  author: {
    user: string | IUser;
    club: string | IClub;
  };
  status: "public" | "draft";
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    featuredImage: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      user: { type: "ObjectId", ref: "User", required: true },
      club: { type: "ObjectId", ref: "Club", required: true },
    },
    status: {
      type: String,
      required: true,
      default: "draft",
      enum: ["public", "draft"],
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);
export default Blog;
