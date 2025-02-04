/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['fakestoreapi.com']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];
  },
  webpack: (config) => {
    // Ensure that Webpack will resolve .ts and .tsx files when no extension is provided.
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  }
};

module.exports = nextConfig;
