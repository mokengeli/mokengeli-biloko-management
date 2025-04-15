/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`, // Proxy vers l'API Gateway
      },
    ];
  },
};

export default nextConfig;
