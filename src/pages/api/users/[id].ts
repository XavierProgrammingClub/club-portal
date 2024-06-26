import { genSalt, hash } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

import { connectDatabase } from "@/lib/db";
import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { adminUpdateUserSchema } from "@/validators";

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

    const user = await getCurrentUserDetails({ req, res });
    if (!user || !(user.role === "superuser")) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
      @Delete /api/users/:id
      @desc Delete a user
    */
    if (req.method === "DELETE") {
      if ((user._id as any).toHexString() === id) {
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
      const parsed = adminUpdateUserSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      if (data.role === "superuser") {
        const user = await getCurrentUserDetails({ req, res });
        if (user.role !== "superuser") {
          return res
            .status(422)
            .json({ status: "ERROR", message: "You are not an admin" });
        }
      }
      if (!data.profilePic) data.profilePic = "users/r28y6kquvetyzvzpybxp";
      if (!data.password) delete data.password;

      if (data.password) {
        const salt = await genSalt(12);
        data.password = await hash(data.password, salt);
      }

      await User.updateOne({ _id: id }, data);
      return res.json({ status: "OK", message: "User updated successfully!" });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
