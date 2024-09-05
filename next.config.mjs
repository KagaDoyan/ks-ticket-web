// next.config.mjs
export default {
    reactStrictMode: true,       // Enables React's Strict Mode
    swcMinify: true,             // Uses SWC for minification instead of Terser for faster builds
    distDir: 'build',            // Custom build output directory
    images: {
      domains: ['example.com'],  // Configures allowed external domains for images
    },
    env: {
      CUSTOM_VAR: process.env.CUSTOM_VAR, // Pass environment variables to the client
    },
    i18n: {
      locales: ['en', 'fr', 'de'], // Configures locales for internationalization
      defaultLocale: 'en',         // Sets the default locale
    },
    webpack: (config, { isServer }) => {
      // Custom Webpack configuration
      if (!isServer) {
        config.resolve.fallback = { fs: false }; // Fixes 'fs' module not found issue for client-side
      }
      return config;
    },
  };
  