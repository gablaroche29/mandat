import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  // Replace 'facturation' with your actual GitHub repo name
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
}

export default nextConfig
