import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_PUBLIC_* vars are already auto-available client-side via .env
  // NEXTAUTH_SECRET is server-only — DO NOT expose it in `env`
};

export default nextConfig;
