// Expo's web CSS pipeline runs PostCSS; without this, global.css is served
// verbatim and `@import "tailwindcss"` never expands.
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
