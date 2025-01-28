/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',    // Change to static export
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig
