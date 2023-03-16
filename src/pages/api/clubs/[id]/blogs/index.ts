import { NextApiRequest, NextApiResponse } from "next";

import Blog from "@/models/blog";
import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { blogSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, all } = req.query;

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
          @GET /api/clubs/:id
          @desc Get a club details
        */

    if (req.method === "GET") {
      // All stands for all blogs and not just public ones
      if (all) {
        const user = await getCurrentUserDetails({ req, res });

        if (!user) {
          return res
            .status(401)
            .json({ status: "ERROR", message: "Unauthorized" });
        }

        const club = await Club.find({
          _id: id,
          members: {
            $elemMatch: {
              user: user._id,
            },
          },
        });

        if (!(user.role === "superuser") && club.length === 0) {
          return res
            .status(401)
            .json({ status: "ERROR", message: "Unauthorized" });
        }
      }

      const findQuery: any = {};
      if (!all) findQuery.status = "public";

      const blogs = await Blog.find({
        ...findQuery,
        "author.club": id,
      }).populate("author.user");

      return res.json({ status: "OK", blogs });
    }

    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "POST") {
      const club = await Club.find({
        _id: id,
        members: {
          $elemMatch: {
            user: user._id,
          },
        },
      });

      if (!(user.role === "superuser") && club.length === 0) {
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

      await Blog.create({
        ...data,
        author: {
          club: id,
          user: user._id,
        },
      });

      return res.json({ status: "OK", message: "Blog created successfully" });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
