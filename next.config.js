/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'api.slingacademy.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'gqb2tfsupqewyln7.public.blob.vercel-storage.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'cdn-icons-png.flaticon.com',
                port: '',
            },
        ],
    },
    transpilePackages: ['geist'],
};

module.exports = nextConfig;
