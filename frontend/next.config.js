const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => { config.resolve.alias["components"] = path.resolve(__dirname, "src/components"); config.resolve.alias["lib"] = path.resolve(__dirname, "src/lib"); config.resolve.alias["contexts"] = path.resolve(__dirname, "src/contexts"); config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;

