/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce complexity in build traces
  output: 'standalone',
  // Disable unnecessary features for now
  optimizeFonts: false,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
