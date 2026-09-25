import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/content/experiences/datingsim/out",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
