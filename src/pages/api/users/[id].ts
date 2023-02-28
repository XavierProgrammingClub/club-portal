import { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { loginSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    const user = await getCurrentUserDetails({ req, res });
    if (!user || !(user.role === "superuser")) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
      @GET /api/users/:id
      @desc Get a user details
    */
    if (req.method === "GET") {
      const user = await User.findById(id).select("-password");

      if (!user)
        return res
          .status(404)
          .json({ status: "ERROR", message: "User not found!" });

      return res.json({ status: "OK", user });
    }

    /*
      @Delete /api/users/:id
      @desc Delete a user
    */
    if (req.method === "DELETE") {
      if (user._id.toHexString() === id) {
        return res
          .status(400)
          .json({ status: "ERROR", message: "You can't delete yourself" });
      }
      await User.deleteOne({ _id: id });

      return res.json({ status: "OK", message: "User deleted successfully!" });
    }

    /*
      @PUT /api/users/:id
      @desc Update a user details
    */
    if (req.method === "PATCH") {
      await User.updateOne({ _id: id }, req.body);
      return res.json({ status: "OK", message: "User updated successfully!" });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
