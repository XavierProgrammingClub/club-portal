import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Input, Button } from "@/components/ui";
import { useUser } from "@/hooks/useUser";
import { queryClient } from "@/pages/_app";
import { LoginUserCredentialsDTO, loginUserSchema } from "@/validators";

import styles from "./signin.module.css";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginUserCredentialsDTO>({
    resolver: zodResolver(loginUserSchema),
    mode: "all",
  });

  const { data: userData, isLoading } = useUser();

  const router = useRouter();

  if (isLoading) return null;
  if (userData?.user) {
    router.push("/");
    return;
  }

  const handleLogin = async (data: LoginUserCredentialsDTO) => {
    const response = await signIn("credentials", {
      redirect: false,
      ...data,
      callbackUrl: "/",
    });

    await queryClient.refetchQueries(["current-user"]);
    if (response?.ok) return router.push("/");
    if (response?.error) {
      toast(response.error, { type: "error" });
    }
  };

  return (
    <>
      <main className={styles.signinWrapper}>
        <div className={styles.signinContainer}>
          <div className={`${styles.signinBlock} ${styles.mainBlock}`}>
            <h1 className={styles.mainBlock__title}>Sign in</h1>
          </div>

          <form
            className={styles.signinBlock}
            onSubmit={handleSubmit(handleLogin)}
          >
            <Input
              label="Email"
              placeholder="sub@xavier.edu.np"
              autoFocus
              required
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              placeholder="********"
              type="password"
              required
              {...register("password")}
              error={errors.password?.message}
            />

            <Link className={styles.forgotPassword} href={"/"}>
              Forgot Password?
            </Link>

            <Button disabled={isSubmitting}>Sign In</Button>
          </form>
        </div>
      </main>
    </>
  );
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getServerAuthSession(context);
//
//   if (session)
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//
//   return {
//     props: { session },
//   };
// };

export default SignIn;
