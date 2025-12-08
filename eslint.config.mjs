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
]);

export default eslintConfig;
