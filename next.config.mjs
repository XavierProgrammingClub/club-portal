import { withAxiom } from "next-axiom";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default withAxiom(nextConfig);
