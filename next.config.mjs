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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.accounts.dev https://clerk.solaris-ai.xyz https://js.stripe.com https://www.google.com https://www.gstatic.com blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob: https://*.clerk.accounts.dev https://clerk.solaris-ai.xyz https://img.clerk.com",
              "font-src 'self' data:",
              "connect-src 'self' https: wss: https://*.clerk.accounts.dev https://clerk.accounts.dev https://clerk.solaris-ai.xyz https://api.stripe.com https://www.google.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://billing.stripe.com https://www.google.com",
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
