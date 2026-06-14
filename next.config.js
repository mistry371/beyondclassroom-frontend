/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'beyondclassroom.co.in' },
      { protocol: 'https', hostname: 'www.beyondclassroom.co.in' },
      { protocol: 'https', hostname: 'beyondclassroom.netlify.app' },
      { protocol: 'https', hostname: 'beyondclassroom-backend.onrender.com' },
      { protocol: 'https', hostname: '**.netlify.app' },
    ],
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = nextConfig
