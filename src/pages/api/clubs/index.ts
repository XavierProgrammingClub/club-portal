import { NextApiRequest, NextApiResponse } from "next";

import { connectDatabase } from "@/lib/db";
import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { newClubSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
      @GET /api/clubs
      @desc Get all clubs
    */
    if (req.method === "GET") {
      const clubs = await Club.find().select("-announcements");

      return res.json({ status: "OK", clubs });
    }

    const user = await getCurrentUserDetails({ req, res });
    if (!user || !(user.role === "superuser")) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
      @POST /api/clubs
      @desc Create new club
    */
    if (req.method === "POST") {
      const parsed = newClubSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      const club = await Club.create(data);

      return res.json({ status: "OK", club });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
