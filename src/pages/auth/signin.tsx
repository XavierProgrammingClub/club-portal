import {
  Paper,
  Title,
  Text,
  Container,
  TextInput,
  PasswordInput,
  Button,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { useUser } from "@/hooks/useUser";
import { queryClient } from "@/pages/_app";
import { LoginUserCredentialsDTO, loginUserSchema } from "@/validators";

const SignIn = () => {
  const form = useForm<LoginUserCredentialsDTO>({
    validate: zodResolver(loginUserSchema),
    validateInputOnBlur: true,
    initialValues: {
      email: "",
      password: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userData, isLoading } = useUser();

  const router = useRouter();

  if (userData?.user) {
    router.push("/");
    return;
  }

  const handleLogin = async (data: LoginUserCredentialsDTO) => {
    setIsSubmitting(true);
    const response = await signIn("credentials", {
      redirect: false,
      ...data,
      callbackUrl: "/",
    });

    setIsSubmitting(false);
    if (response?.ok) {
      await queryClient.refetchQueries(["current-user"]);
      showNotification({
        icon: <IconCheck size={16} />,
        color: "teal",
        title: "Logged in successfully",
        message: "Explore the dashboard",
      });
      return router.push("/");
    }

    if (response?.error) {
      showNotification({
        title: "Error Occured while signing in!",
        message: response.error,
        icon: <IconX size={16} />,
        color: "red",
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({
          fontFamily: `Greycliff CF, ${theme.fontFamily}`,
          fontWeight: 900,
        })}
      >
        Welcome back!
      </Title>
      <Text color="dimmed" size="md" align="center" mt={5} weight="bold">
        Club Portal
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleLogin)}>
          <TextInput
            label="Email"
            type="email"
            placeholder="you@website.com"
            {...form.getInputProps("email")}
            error={form.errors.email}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            {...form.getInputProps("password")}
            error={form.errors.password}
          />
          <Button fullWidth mt="xl" type="submit" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SignIn;
