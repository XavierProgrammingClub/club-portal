import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: clubId } = req.query;
  const { userId } = req.query;
  console.log(req.query);

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    /*
                  @GET /api/clubs/:id
                  @desc Get a club details
                */
    // if (req.method === "GET") {
    //   const club = await Club.findById(clubId).populate("members.user");
    //
    //   if (!club)
    //     return res
    //       .status(404)
    //       .json({ status: "ERROR", message: "Club not found!" });
    //
    //   return res.json({ status: "OK", members: club.members });
    // }

    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    /*
                  @DELETE /api/clubs/:id
                  @desc Delete a club
                */
    if (req.method === "DELETE") {
      const club = await Club.find({
        _id: clubId,
        members: {
          user: user._id,
          permissions: { canRemoveMembers: true },
        },
      });

      if (!(user.role === "superuser") && !club) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      await Club.findOneAndUpdate(
        { _id: clubId },
        {
          $pull: {
            members: {
              user: userId,
            },
          },
        }
      );

      return res.json({ status: "OK", message: "Club deleted successfully!" });
    }

    /*
                  @PUT /api/club/:id
                  @desc Update a club details
                */
    if (req.method === "PATCH") {
      const club = await Club.find({
        _id: clubId,
        members: {
          user: user._id,
          permissions: { canManagePermissions: true },
        },
      });

      if (!(user.role === "superuser") && !club) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      // const parsed = updateClubSchema.safeParse(req.body);
      // if (!parsed.success)
      //   return res.status(422).json({
      //     status: "ERROR",
      //     message: "Validation Error Occurred",
      //     error: parsed.error,
      //   });

      // const { data } = parsed;

      await Club.updateOne(
        { _id: clubId, "members.user": userId },
        {
          $set: {
            "members.$": req.body,
          },
        }
      );
      return res.json({ status: "OK", message: "User updated successfully!" });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
