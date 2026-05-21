import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : 'tmwqagqjzfkbkqomswof.supabase.co';

const nextConfig: NextConfig = {
    allowedDevOrigins: ["192.168.1.7"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: supabaseHostname,
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    turbopack: {
        root: projectRoot,
    },
};

export default nextConfig;
