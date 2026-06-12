module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Drizzle migrations: .sql files imported by the generated
      // src/db/migrations/migrations.js must be bundled as strings.
      ["inline-import", { extensions: [".sql"] }],
    ],
  };
};
