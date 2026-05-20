import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
    allowedDevOrigins: ["192.168.1.7"],
    turbopack: {
        root: projectRoot,
    },
};

export default nextConfig;
