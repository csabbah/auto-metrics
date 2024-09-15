/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["gsap"], // This allows us to use GSAP
};

module.exports = nextConfig;
