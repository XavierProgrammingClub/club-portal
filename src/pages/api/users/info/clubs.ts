import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    const user = await getCurrentUserDetails({ req, res });

    if (!user)
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found!" });

    /*
          @GET /api/users/info/clubs
          @desc Get current user's club information
        */
    if (req.method === "GET") {
      const clubs = await Club.find({ "members.user": user._id });
      return res.json({ status: "OK", clubs });
    }

    /*
          @PATCH /api/users/info
          @desc Updates current user information
        */
    // if (req.method === "PATCH") {
    //   await User.updateOne({ _id: user._id }, req.body);
    //   return res.json({ status: "OK", message: "User updated successfully!" });
    // }
  } catch (error) {
    return res
      .status(400)
      .json({ status: "ERROR", message: (error as Error).message });
  }
}
