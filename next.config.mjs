/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "quiikly.com",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
