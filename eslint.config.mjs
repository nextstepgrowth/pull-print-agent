// ESLint v9+ flat config
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-undef": "off",
      "no-empty": ["warn", { "allowEmptyCatch": true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
  {
    files: ["*.js"],
    rules: { "no-undef": "off", "@typescript-eslint/no-unused-expressions": "off" }
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: {
        jest: false,
        describe: false,
        it: false,
        beforeEach: false,
        afterEach: false,
        beforeAll: false,
        afterAll: false,
        expect: false
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];
