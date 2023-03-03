import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const newUserSchema = z.object({
  profilePic: z.string().optional(),
  name: z.string().min(3).max(255),
  password: z.string().min(6),
  email: z.string().email().max(1024).min(3),
});

export const updateUserSchema = z.object({
  profilePic: z.string().optional(),
  name: z.string().min(3).max(255).optional(),
});

export const adminUpdateUserSchema = updateUserSchema.merge(z.object({}));

export const newClubSchema = z.object({
  name: z.string(),
  description: z.string(),
  profilePic: z.string(),
  banner: z.string().optional(),
  members: z.array(
    z.object({
      user: z.string(),
      role: z.string(),
      showcase: z.boolean(),
      permissions: z.object({
        canAddMembers: z.boolean(),
        canPublishAnnouncements: z.boolean(),
        canRemoveMembers: z.boolean(),
        canPublishBlogs: z.boolean(),
        canManageClubSettings: z.boolean(),
        canManagePermissions: z.boolean(),
      }),
    })
  ),
  isAvailableForRegistration: z.boolean(),
});

export const updateClubSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  profilePic: z.string().optional(),
  banner: z.string().optional(),
  isAvailableForRegistration: z.boolean().optional(),
});

export type LoginUserCredentialsDTO = z.infer<typeof loginUserSchema>;
export type NewUserCredentialsDTO = z.infer<typeof newUserSchema>;
export type UpdateUserCredentialsDTO = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserCredentialsDTO = z.infer<
  typeof adminUpdateUserSchema
>;
