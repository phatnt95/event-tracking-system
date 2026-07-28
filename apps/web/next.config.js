/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@baby-tracker/shared-types'],
};

module.exports = nextConfig;
