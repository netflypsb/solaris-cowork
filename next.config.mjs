/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Solaris Cowork",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fancy-dragon-71.clerk.accounts.dev https://*.clerk.accounts.dev https://js.stripe.com blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://fancy-dragon-71.clerk.accounts.dev https://*.clerk.accounts.dev",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://fancy-dragon-71.clerk.accounts.dev https://*.clerk.accounts.dev https://api.stripe.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
