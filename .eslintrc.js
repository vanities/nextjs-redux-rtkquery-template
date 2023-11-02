module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    "jest/globals": true,
  },
  extends: [
    "plugin:react/recommended",
    "standard",
    "prettier",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "jest"],
  rules: {
    "react/react-in-jsx-scope": 0,
    "no-empty-pattern": 0,
    "no-void": 0,
    noImplicitAny: 0,
    "no-extend-native": 0,
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    camelcase: ["off"],
  },
};
