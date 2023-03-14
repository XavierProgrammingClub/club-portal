import mongoose from "mongoose";

import { IUser } from "@/models/user";

export interface IMember {
  _id: string;
  user: IUser;
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

export interface IClub {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  profilePic: string;
  banner?: string;
  members: IMember[];
  isAvailableForRegistration: boolean;
  announcements: IAnnouncement[];
}

export interface IAnnouncement {
  _id: string;
  title: string;
  description: string;
  author: {
    user: IUser;
    role: string;
  };
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new mongoose.Schema<IAnnouncement>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  photo: { type: String },
  author: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
  },
  createdAt: {
    type: mongoose.Schema.Types.Date,
    required: true,
  },
  updatedAt: { type: mongoose.Schema.Types.Date },
});

const clubSchema = new mongoose.Schema<IClub>(
  {
    name: { type: String, required: true },
    shortDescription: { type: String, required: true, default: "" },
    description: { type: String, required: true, default: "" },
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
