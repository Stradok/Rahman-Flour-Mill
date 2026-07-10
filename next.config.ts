import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3-multiple-ciphers", "drizzle-orm"],
};

export default nextConfig;
