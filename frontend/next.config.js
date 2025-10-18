const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      lib: path.resolve(__dirname, 'src/lib'),
      contexts: path.resolve(__dirname, 'src/contexts'),
    };
    return config;
  },
};

module.exports = nextConfig;
