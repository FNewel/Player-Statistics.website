/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,      // Turn off fs module for client side
                path: false,    // Turn off path module for client side
            };
        }
        return config;
    },
};

export default nextConfig;
