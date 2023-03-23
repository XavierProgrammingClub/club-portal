import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/lib/db";
import { newMemberSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
              @GET /api/clubs/:id/members
              @desc Get all members
            */
    if (req.method === "GET") {
      const club = await Club.findById(id).populate("members.user");

      if (!club)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Club not found!" });

      return res.json({ status: "OK", members: club.members });
    }

    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "POST") {
      const parsed = newMemberSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      const club = await Club.find({
        _id: id,
        members: {
          $elemMatch: {
            user: user._id,
            "permissions.canAddMembers": true,
          },
        },
      });

      if (!(user.role === "superuser") && club.length <= 0) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(data.user))
        return res
          .status(400)
          .json({ status: "ERROR", message: "Invalid Member!" });

      const userExists = await User.exists({ _id: data.user });
      if (!userExists)
        return res
          .status(400)
          .json({ status: "ERROR", message: "Invalid Member!" });

      await Club.updateOne(
        { _id: id, "members.user": { $ne: data.user } },
        { $push: { members: data } }
      );

      return res.json({ status: "OK", message: "Member added successfully!" });
    }
    //
    // const user = await getCurrentUserDetails({ req, res });
    //
    // if (!user) {
    //   return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: "ERROR", error });
  }
}
