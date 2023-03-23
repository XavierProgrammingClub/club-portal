import { NextApiRequest, NextApiResponse } from "next";

import { connectDatabase } from "@/lib/db";
import Blog, { IBlog } from "@/models/blog";
import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { blogSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: clubId, blogId } = req.query;

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "GET") {
      const club = await Club.find({
        _id: clubId,
        members: {
          $elemMatch: {
            user: user._id,
          },
        },
      });

      if (club.length === 0) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      const blog = await Blog.findById(blogId);

      return res.json({ status: "OK", blog });
    }

    if (req.method === "DELETE") {
      const club = await Club.find({
        _id: clubId,
        members: {
          $elemMatch: {
            user: user._id,
            "permissions.canPublishBlogs": true,
          },
        },
      });

      const blog = (await Blog.find({ _id: blogId }))[0] as any as IBlog;
      if (!blog)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Blog not found" });

      if (
        !(user.role === "superuser") &&
        club.length === 0 &&
        (blog.author.user as any).toHexString() !==
          (user._id as any).toHexString()
      ) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      await Blog.deleteOne({ _id: blogId, "author.club": clubId });

      return res.json({ status: "OK", message: "Blog deleted successfully!" });
    }

    /*
          @PUT /api/club/:id
          @desc Update a club details
        */
    if (req.method === "PATCH") {
      const club = await Club.find({
        _id: clubId,
        members: {
          $elemMatch: {
            user: user._id,
            "permissions.canPublishBlogs": true,
          },
        },
      });

      const blog = (await Blog.find({ _id: blogId }))[0] as any as IBlog;
      if (!blog)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Blog not found" });

      if (
        !(user.role === "superuser") &&
        club.length === 0 &&
        (blog.author.user as any).toHexString() !==
          (user._id as any).toHexString()
      ) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      const parsed = blogSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      await Blog.updateOne({ _id: blogId, "author.club": clubId }, data);
      return res.json({ status: "OK", message: "Blog updated successfully!" });
    }
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ status: "ERROR", error: error.message });
  }
}
