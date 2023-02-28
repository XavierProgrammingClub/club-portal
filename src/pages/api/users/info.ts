import { NextApiRequest, NextApiResponse } from "next";

import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  /*
    @GET /api/users/info
    @desc Get current user information
  */
  if (req.method === "GET") {
    try {
      const user = await getCurrentUserDetails({ req, res });

      if (!user)
        return res
          .status(404)
          .json({ status: "ERROR", message: "User not found!" });

      return res.json({ status: "OK", user });
    } catch (error) {
      return res
        .status(400)
        .json({ status: "ERROR", message: (error as Error).message });
    }
  }
}
