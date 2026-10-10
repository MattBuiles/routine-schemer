import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // strata se publica como TypeScript fuente, sin compilar.
  transpilePackages: ["strata"],
};

export default nextConfig;
