const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: ".",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleDirectories: ["node_modules", "src"],
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/helpers/",
    "<rootDir>/src/__tests__/mocks/",
  ],
  moduleNameMapper: {
    "react-markdown":
      "<rootDir>/node_modules/react-markdown/react-markdown.min.js",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
