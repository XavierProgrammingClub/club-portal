import mongoose from "mongoose";

import { IUser } from "@/models/user";

export interface IClub {
  _id: string;
  name: string;
  description: string;
  profilePic: string;
  banner?: string;
  members: [
    {
      user: string | IUser;
      role:
        | "President"
        | "Vice President"
        | "Secretary"
        | "Active Member"
        | "General Member"
        | string;
      rank: number;
      showcase: boolean;
      permissions: {
        canAddMembers: boolean;
        canPublishAnnouncements: boolean;
        canRemoveMembers: boolean;
        canPublishBlogs: boolean;
        canManageClubSettings: boolean;
        canManagePermissions: boolean;
      };
    }
  ];
  isAvailableForRegistration: boolean;
  announcements: IAnnouncement[];
}

interface IAnnouncement {
  title: string;
  description: string;
  photo?: string;
}

const announcementSchema = new mongoose.Schema<IAnnouncement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
});

const clubSchema = new mongoose.Schema<IClub>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    profilePic: { type: String, required: true },
    banner: { type: String, required: false },
    members: [
      {
        user: { type: "ObjectId", ref: "User", required: true },
        role: { type: "String", required: true },
        rank: { type: Number },
        showcase: { type: Boolean, default: true },
        permissions: {
          canAddMembers: { type: Boolean, required: true },
          canPublishAnnouncements: { type: Boolean, required: true },
          canRemoveMembers: { type: Boolean, default: false },
          canPublishBlogs: { type: Boolean, required: true },
          canManageClubSettings: { type: Boolean, required: true },
          canManagePermissions: { type: Boolean, required: true },
        },
      },
    ],
    isAvailableForRegistration: { type: Boolean, default: false },
    announcements: { type: [announcementSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Club = mongoose.models.Club || mongoose.model<IClub>("Club", clubSchema);
export default Club;
