/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/antigravity_reinsur' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
