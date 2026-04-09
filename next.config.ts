import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@calcom/embed-react",
    "@calcom/embed-core",
    "@calcom/embed-snippet",
  ],
};

export default nextConfig;
