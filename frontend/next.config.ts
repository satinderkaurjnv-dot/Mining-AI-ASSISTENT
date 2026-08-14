import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/chat",
        destination:
          "https://mining-ai-assistent-el6l.vercel.app/api/chat",
      },
    ];
  },
};

export default nextConfig;