module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: ["dist", "coverage", "node_modules"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "prettier/prettier": "error"
  }
};
