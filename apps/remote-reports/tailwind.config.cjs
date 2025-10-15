const baseConfig = require('@one-portal/tailwind-config/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: {
    files: [
      './src/**/*.{js,jsx,ts,tsx,html}',
      '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
    ],
  },
};
