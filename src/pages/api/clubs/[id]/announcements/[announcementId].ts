import { NextApiRequest, NextApiResponse } from "next";

import Club from "@/models/club";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";
import { updateAnnouncementSchema } from "@/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: clubId, announcementId } = req.query;

  await connectDatabase().catch(() =>
    res.json({ status: "ERROR", message: "Internal Server Error" })
  );

  try {
    const user = await getCurrentUserDetails({ req, res });

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Unauthorized" });
    }

    if (req.method === "GET") {
      const club = await Club.find({
        _id: clubId,
        members: {
          $elemMatch: {
            user: user._id,
          },
        },
      }).select({ announcements: { $elemMatch: { _id: announcementId } } });

      if (!(user.role === "superuser") && club.length <= 0) {
        return res
          .status(401)
          .json({ status: "ERROR", message: "Unauthorized" });
      }

      return res.json({
        status: "OK",
        announcement: club[0].announcements[0],
      });
    }

    const club = await Club.find({
      _id: clubId,
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

    /*
                  @DELETE /api/clubs/:id
                  @desc Delete a club
                */
    if (req.method === "DELETE") {
      await Club.findOneAndUpdate(
        { _id: clubId },
        {
          $pull: {
            announcements: {
              _id: announcementId,
            },
          },
        }
      );

      return res.json({
        status: "OK",
        message: "Announcement deleted successfully!",
      });
    }

    /*
                  @PUT /api/club/:id
                  @desc Update a club details
                */
    if (req.method === "PATCH") {
      const parsed = updateAnnouncementSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(422).json({
          status: "ERROR",
          message: "Validation Error Occurred",
          error: parsed.error,
        });

      const setterObject: { [key: string]: string } = {};

      for (const [key, value] of Object.entries(parsed.data)) {
        setterObject[`announcements.$.${key}`] = value;
      }

      await Club.updateOne(
        { _id: clubId, "announcements._id": announcementId },
        {
          $set: {
            ...setterObject,
            "announcements.$.updatedAt": Date.now(),
          },
        }
      );

      return res.json({
        status: "OK",
        message: "Announcement updated successfully!",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: "ERROR", error });
  }
}
