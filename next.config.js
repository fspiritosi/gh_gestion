/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
      hmrRefreshes: true
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zktcbhhlcksopklpnubj.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1'
      }
    ]
  }
}

module.exports = nextConfig
