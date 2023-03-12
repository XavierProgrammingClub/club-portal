import { Dialog } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import Link from "next/link";
import { useRouter } from "next/router";
import { CldImage } from "next-cloudinary";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { SingleValue } from "react-select";
import AsyncSelect from "react-select/async";

import { ClubDashboardNavbar } from "@/components/ClubDashboardNavbar";
import { clubMembersRole, defaultPermissions } from "@/constants";
import { useSingleClub } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { NewMemberCredentialsDTO, newMemberSchema } from "@/validators";

const getUsers = async (
  searchQuery: string
): Promise<{ status: "OK" | "ERROR"; users: IUser[] }> => {
  return axios.get("/api/users", { params: { search: searchQuery } });
};

const formatOptionLabel = (value: IUser) => {
  return (
    <div>
      <CldImage
        width="50"
        height="50"
        src={value.profilePic}
        alt="Description of my image"
      />
      <p>
        {value.name} {value.email}
      </p>
    </div>
  );
};

const AdminSingleClub = () => {
  const router = useRouter();

  const { id } = router.query;
  const [isModalOpened, setIsModalOpened] = useState(false);

  const { data: userData, isLoading: isUserLoading } = useUser();
  const { data, isLoading: isClubLoading } = useSingleClub({
    id: id as string,
    enabled: router.isReady,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<NewMemberCredentialsDTO>({
    resolver: zodResolver(newMemberSchema),
    reValidateMode: "onBlur",
    mode: "all",
    defaultValues: {
      permissions: clubMembersRole.find(
        (role) => role.title === "Active Member"
      )?.permissions,
    },
  });

  const loadOptions = debounce((inputText: string, callback) => {
    getUsers(inputText).then((data) => callback(data.users));
  }, 1000);

  const currentClubUser = useMemo(
    () => data?.club.members.find((d) => d.user._id === userData?.user._id),
    [data]
  );
  if (!currentClubUser) return;

  const currentUserPermissions = currentClubUser?.permissions;
  if (isUserLoading || isClubLoading) return;
  const isSuperUser = userData?.user.role === "superuser";

  const handleAddMember = async (data: NewMemberCredentialsDTO) => {
    const response = await axios.post(`/api/clubs/${id}/members/`, data);
    setIsModalOpened(false);
    await queryClient.refetchQueries(["club", id]);
    console.log(response);
  };

  const handleDeleteMember = async (userId: string) => {
    await axios.delete(`/api/clubs/${id}/members/${userId}`);
    await queryClient.refetchQueries(["club", id]);
  };

  const handleRoleSelectChange = (
    val: SingleValue<{ value: string; label: string }>
  ) => {
    setValue("role", val?.value as string);
    const userPermission = clubMembersRole.find(
      (role) => role.title === val?.value
    );
    if (!userPermission) {
      return setValue("permissions", defaultPermissions);
    }

    setValue("permissions", userPermission.permissions);
  };

  return (
    <>
      <ClubDashboardNavbar />

      {isSuperUser || currentUserPermissions.canAddMembers ? (
        <button onClick={() => setIsModalOpened(true)}>Add Member</button>
      ) : null}

      <Dialog open={isModalOpened} onClose={() => setIsModalOpened(false)}>
        <div
          className="fixed inset-0 bg-black/30"
          aria-hidden="true"
          style={{
            inset: "0",
            position: "fixed",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Dialog.Panel
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "1rem",
              borderRadius: "1rem",
              boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
              width: "300px",
            }}
          >
            <Dialog.Title>Add Member</Dialog.Title>
            <Dialog.Description>You can do this </Dialog.Description>

            <p>Bruh</p>

            <form onSubmit={handleSubmit(handleAddMember)}>
              <AsyncSelect
                loadOptions={loadOptions}
                formatOptionLabel={formatOptionLabel}
                onChange={(val) => setValue("user", val?._id as string)}
              />

              <div>
                <Select
                  options={[
                    { value: "President", label: "President" },
                    { value: "Vice President", label: "Vice President" },
                    { value: "Secretary", label: "Secretary" },
                    { value: "Treasurer", label: "Treasurer" },
                    { value: "Active Member", label: "Active Member" },
                    { value: "General Member", label: "General Member" },
                  ]}
                  onChange={handleRoleSelectChange}
                />
              </div>

              <div>
                <label htmlFor="showcase">Showcase</label>
                <input
                  type="checkbox"
                  id="showcase"
                  defaultChecked={true}
                  {...register("showcase")}
                />
              </div>

              <div>
                <label htmlFor="canAddMembers">canAddMembers</label>
                <input
                  type="checkbox"
                  id="canAddMembers"
                  {...register("permissions.canAddMembers")}
                />
              </div>

              <div>
                <label htmlFor="canPublishAnnouncements">
                  canPublishAnnouncements
                </label>
                <input
                  type="checkbox"
                  id="canPublishAnnouncements"
                  {...register("permissions.canPublishAnnouncements")}
                />
              </div>

              <div>
                <label htmlFor="canRemoveMembers">canRemoveMembers</label>
                <input
                  type="checkbox"
                  id="canRemoveMembers"
                  {...register("permissions.canRemoveMembers")}
                />
              </div>

              <div>
                <label htmlFor="canPublishBlogs">canPublishBlogs</label>
                <input
                  type="checkbox"
                  id="canPublishBlogs"
                  {...register("permissions.canPublishBlogs")}
                />
              </div>

              <div>
                <label htmlFor="canManageClubSettings">
                  canManageClubSettings
                </label>
                <input
                  type="checkbox"
                  id="canManageClubSettings"
                  {...register("permissions.canManageClubSettings")}
                />
              </div>

              <div>
                <label htmlFor="canManagePermissions">
                  canManagePermissions
                </label>
                <input
                  type="checkbox"
                  id="canManagePermissions"
                  {...register("permissions.canManagePermissions")}
                />
              </div>

              <button disabled={isSubmitting}>Add</button>
              <button type="button" onClick={() => setIsModalOpened(false)}>
                Cancel
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <ul>
        <p>members</p>
        {data?.club.members.map((member) => (
          <li key={member?._id}>
            <Link href={`/clubs/${id}/dashboard/${member.user._id}`}>
              #{member.user._id} {member.user.email} {member.user.name}
            </Link>
            {isSuperUser || currentUserPermissions.canRemoveMembers ? (
              <button onClick={() => handleDeleteMember(member.user._id)}>
                Delete
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
};

export default AdminSingleClub;
