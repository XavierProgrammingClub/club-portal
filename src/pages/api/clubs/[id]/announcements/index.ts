import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Club, { IAnnouncement, IClub } from "@/models/club";
import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { newAnnouncementSchema } from "@/validators";

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

    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "GET") {
      const findFilter: any = {};
      if (user.role !== "superuser")
        findFilter.members = {
          $elemMatch: {
            user: user._id,
          },
        };

      const club = await Club.find({
        _id: id,
        ...findFilter,
      }).populate("announcements.author.user");

      if (club.length === 0)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Club not found!" });

      return res.json({
        status: "OK",
        announcements: club[0].announcements.sort(
          (a: IAnnouncement, b: IAnnouncement) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      });
    }

    const club = await Club.find({
      _id: id,
      members: {
        $elemMatch: {
          user: user._id,
          "permissions.canPublishAnnouncements": true,
        },
      },
    });

    if (!(user.role === "superuser") && club.length <= 0) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "POST") {
      const parsed = newAnnouncementSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;
      if (!mongoose.Types.ObjectId.isValid(data.author.user))
        return res
          .status(400)
          .json({ status: "ERROR", message: "You are not part of this club!" });

      const userExists = await User.exists({ _id: data.author.user });
      if (!userExists)
        return res
          .status(400)
          .json({ status: "ERROR", message: "You are not part of this club!" });

      await Club.updateOne(
        { _id: id },
        { $push: { announcements: { ...data, createdAt: Date.now() } } }
      );

      return res.json({
        status: "OK",
        message: "Announcement created successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: "ERROR", error });
  }
}
