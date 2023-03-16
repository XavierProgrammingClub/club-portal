import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const newUserSchema = z.object({
  profilePic: z.string().optional(),
  name: z.string().min(3).max(255),
  password: z.string().min(6),
  email: z.string().email().max(1024).min(3),
});

export const adminNewUserSchema = newUserSchema.merge(
  z.object({ role: z.string().optional() })
);

export const updateUserSchema = z.object({
  profilePic: z.string().optional(),
  name: z.string().min(3).max(255).optional(),
});

export const adminUpdateUserSchema = updateUserSchema.merge(
  z.object({
    email: z.string().min(3).optional(),
    role: z.string().optional(),
    password: z.string().optional(),
  })
);

export const newMemberSchema = z.object({
  user: z.string(),
  role: z.string().min(3),
  rank: z.number().optional(),
  showcase: z.boolean(),
  permissions: z.object({
    canAddMembers: z.boolean(),
    canPublishAnnouncements: z.boolean(),
    canRemoveMembers: z.boolean(),
    canPublishBlogs: z.boolean(),
    canManageClubSettings: z.boolean(),
    canManagePermissions: z.boolean(),
  }),
});

export const updateMemberSchema = z.object({
  role: z.string().min(3).optional(),
  rank: z.number().optional(),
  showcase: z.boolean().optional(),
  permissions: z
    .object({
      canAddMembers: z.boolean().optional(),
      canPublishAnnouncements: z.boolean().optional(),
      canRemoveMembers: z.boolean().optional(),
      canPublishBlogs: z.boolean().optional(),
      canManageClubSettings: z.boolean().optional(),
      canManagePermissions: z.boolean().optional(),
    })
    .optional(),
});

export const newClubSchema = z.object({
  name: z.string(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  profilePic: z.string().optional(),
  banner: z.string().optional(),
  members: z.array(newMemberSchema).optional(),
  isAvailableForRegistration: z.boolean(),
});

export const updateClubSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  shortDescription: z.string().min(3).max(1024).optional(),
  description: z.string().min(3).max(10000).optional(),
  profilePic: z.string().optional(),
  banner: z.string().optional(),
  isAvailableForRegistration: z.boolean().optional(),
});

export const newAnnouncementSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(5).max(500),
  author: z.object({
    user: z.string(),
    role: z.string(),
  }),
  photo: z.string().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(5).max(500).optional(),
  photo: z.string().optional().optional(),
});

export const blogSchema = z.object({
  featuredImage: z.string().min(3, { message: "Featured image is required" }),
  title: z.string().min(5).max(255),
  content: z.string().min(10),
  status: z.string().default("draft"),
});

export const adminUpdateClubSchema = updateClubSchema.merge(z.object({}));

export type LoginUserCredentialsDTO = z.infer<typeof loginUserSchema>;
export type NewUserCredentialsDTO = z.infer<typeof newUserSchema>;
export type AdminNewUserCredentialsDTO = z.infer<typeof adminNewUserSchema>;
export type UpdateUserCredentialsDTO = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserCredentialsDTO = z.infer<
  typeof adminUpdateUserSchema
>;

export type NewClubCredentialsDTO = z.infer<typeof newClubSchema>;
export type UpdateClubCredentialsDTO = z.infer<typeof updateClubSchema>;
export type AdminUpdateClubCredentialsDTO = z.infer<
  typeof adminUpdateClubSchema
>;

export type NewMemberCredentialsDTO = z.infer<typeof newMemberSchema>;
export type UpdateMemberCredentialsDTO = z.infer<typeof updateMemberSchema>;

export type NewAnnouncementCredentialsDTO = z.infer<
  typeof newAnnouncementSchema
>;
export type UpdateAnnouncementCredentialsDTO = z.infer<
  typeof updateAnnouncementSchema
>;

export type BlogCredentialsDTO = z.infer<typeof blogSchema>;
