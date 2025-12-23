import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    "dist/**",
    "electron/**/*.js",
    "scripts/**/*.js",
    "db/**/*.js",
  ]),
  {
    rules: {
      // We've fixed all 'any' types - this is now purely informational
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Relaxed rules for test files
  {
    files: ["tests/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off", // Allow require() in tests for dynamic imports
      "@typescript-eslint/no-unused-vars": "warn", // Test helpers may have intentionally unused params
    },
  },
]);

export default eslintConfig;
