import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
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
          user: user._id,
          permissions: { canAddMembers: true },
        },
      });

      if (!(user.role === "superuser") && !club) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      // const club = await Club.findById(id).populate("members.user");
      await Club.updateOne({ _id: id }, { $push: { members: data } });

      if (!club)
        return res
          .status(404)
          .json({ status: "ERROR", message: "Club not found!" });

      return res.json({ status: "OK", message: "Member added successfully!" });
    }
    //
    // const user = await getCurrentUserDetails({ req, res });
    //
    // if (!user) {
    //   return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    // }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
