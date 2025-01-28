/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Optional: Enables React's Strict Mode
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
