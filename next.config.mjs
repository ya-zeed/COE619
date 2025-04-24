/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/prod/:path*',
                destination: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/prod/:path*" || '*',
            },
        ];
    },
};
export default nextConfig;
  