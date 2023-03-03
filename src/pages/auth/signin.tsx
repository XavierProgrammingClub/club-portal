import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { queryClient } from "@/pages/_app";
import { getServerAuthSession } from "@/pages/api/auth/[...nextauth]";
import { LoginUserCredentialsDTO, loginUserSchema } from "@/validators";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginUserCredentialsDTO>({
    resolver: zodResolver(loginUserSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const router = useRouter();

  const handleLogin = async (data: LoginUserCredentialsDTO) => {
    const response = await signIn("credentials", {
      redirect: false,
      ...data,
      callbackUrl: "/",
    });

    await queryClient.refetchQueries(["current-user"]);
    if (response?.ok) return router.push("/");
    console.log(response);
  };

  console.log(errors);

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      <input type="email" placeholder="Email" {...register("email")} />
      <input type="password" placeholder="Password" {...register("password")} />
      <button disabled={isSubmitting}>Login</button>
    </form>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return {
    props: { session },
  };
};

export default SignIn;
