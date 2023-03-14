import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { updateClubSchema } from "@/validators";

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
          @GET /api/clubs/:id
          @desc Get a club details
        */

    if (req.method === "GET") {
      const club = await Club.findById(id)
        .populate("members.user", "-password")
        .select("-announcements");

      if (!club)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Club not found!" });

      return res.json({ status: "OK", club });
    }

    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
          @DELETE /api/clubs/:id
          @desc Delete a club
        */
    if (req.method === "DELETE") {
      if (!(user.role === "superuser")) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      await Club.deleteOne({ _id: id });

      return res.json({ status: "OK", message: "Club deleted successfully!" });
    }

    /*
          @PUT /api/club/:id
          @desc Update a club details
        */
    if (req.method === "PATCH") {
      const club = await Club.find({
        _id: id,
        members: {
          $elemMatch: {
            user: user._id,
            "permissions.canManageClubSettings": true,
          },
        },
      });

      if (!(user.role === "superuser") && club.length <= 0) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      const parsed = updateClubSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      await Club.updateOne({ _id: id }, data);
      return res.json({ status: "OK", message: "User updated successfully!" });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
