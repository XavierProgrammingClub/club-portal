import { NextApiRequest, NextApiResponse } from "next";

import Blog from "@/models/blog";
import { connectDatabase } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    if (req.method === "GET") {
      const blogs = await Blog.find({ status: "public" })
        .populate("author.user")
        .populate("author.club", "name", "profilePic");

      return res.json({ status: "OK", blogs });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
