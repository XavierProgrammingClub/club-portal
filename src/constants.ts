export const clubMembersRole = [
  {
    title: "President",
    level: 10,
    permissions: {
      canAddMembers: true,
      canPublishAnnouncements: true,
      canRemoveMembers: true,
      canPublishBlogs: true,
      canManageClubSettings: true,
      canManagePermissions: true,
    },
  },
  {
    title: "Vice President",
    level: 9,
    permissions: {
      canAddMembers: true,
      canPublishAnnouncements: true,
      canRemoveMembers: true,
      canPublishBlogs: true,
      canManageClubSettings: true,
      canManagePermissions: true,
    },
  },
  {
    title: "Secretary",
    level: 8,
    permissions: {
      canAddMembers: true,
      canPublishAnnouncements: true,
      canRemoveMembers: true,
      canPublishBlogs: true,
      canManageClubSettings: true,
      canManagePermissions: true,
    },
  },
  {
    title: "Treasurer",
    level: 8,
    permissions: {
      canAddMembers: true,
      canPublishAnnouncements: true,
      canRemoveMembers: true,
      canPublishBlogs: true,
      canManageClubSettings: true,
      canManagePermissions: true,
    },
  },
  {
    title: "Active Member",
    level: 7,
    permissions: {
      canAddMembers: false,
      canPublishAnnouncements: false,
      canRemoveMembers: false,
      canPublishBlogs: false,
      canManageClubSettings: true,
      canManagePermissions: false,
    },
  },
  {
    title: "General Member",
    level: 5,
    permissions: {
      canAddMembers: false,
      canPublishAnnouncements: false,
      canRemoveMembers: false,
      canPublishBlogs: false,
      canManageClubSettings: false,
      canManagePermissions: false,
    },
  },
] as const;

export const defaultPermissions = {
  canAddMembers: false,
  canPublishAnnouncements: false,
  canRemoveMembers: false,
  canPublishBlogs: false,
  canManageClubSettings: false,
  canManagePermissions: false,
};
