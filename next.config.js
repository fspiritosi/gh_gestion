/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    // fetches: {
    //   fullUrl: false,
    //   hmrRefreshes: true
    // }
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
  },
  // Aumentar el tamaño máximo de la pila permitido para micromatch
  webpack: (config, { isServer }) => {
    // Aumentar el límite de llamadas recursivas
    config.optimization.nodeEnv = false

    return config
  },
  // Optimizar el proceso de build
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig
