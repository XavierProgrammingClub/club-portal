import { genSalt, hash } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

import User from "@/models/user";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { adminNewUserSchema, newUserSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
     @POST /api/users
     @desc Signup User
    */
    if (req.method === "POST") {
      const parsed = adminNewUserSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const { data } = parsed;

      const user = await User.findOne({ email: data.email });

      if (!data.profilePic) data.profilePic = "users/r28y6kquvetyzvzpybxp";
      if (data.role === "superuser") {
        const user = await getCurrentUserDetails({ req, res });
        if (user.role !== "superuser") {
          return res
            .status(422)
            .json({ status: "ERROR", message: "You are not an admin" });
        }
      }

      if (user)
        return res
          .status(422)
          .json({ status: "ERROR", message: "User Already Exists!" });

      const salt = await genSalt(12);
      data.password = await hash(data.password, salt);
      const newUser = await User.create(data);

      return res.status(201).json({
        message: "User registered successfully",
        status: "OK",
        user: newUser,
      });
    }
    //
    // const user = await getCurrentUserDetails({ req, res });
    // if (!user || !(user.role === "superuser")) {
    //   return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    // }

    /*
      @GET /api/users
      @desc Get all users
    */
    if (req.method === "GET") {
      const searchQuery = req.query.search;
      let filterQuery: any = {};

      if (searchQuery && typeof searchQuery === "string") {
        filterQuery = {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        };
      }

      const users = await User.find(filterQuery).select("-password");
      return res.json({ status: "OK", users });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ status: "ERROR", message: (error as Error).message });
  }
}
