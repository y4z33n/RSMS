import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable all TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      
      // Disable React rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      
      // Disable Next.js rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      
      // Disable general rules
      "no-unused-vars": "off",
      "no-console": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-prototype-builtins": "off",
      "no-constant-condition": "off",
      "no-useless-escape": "off",
      "no-case-declarations": "off",
      "no-empty-pattern": "off",
      "no-extra-boolean-cast": "off",
      "no-async-promise-executor": "off",
      "no-ex-assign": "off",
      "prefer-const": "off",
      "import/no-anonymous-default-export": "off"
    },
    ignorePatterns: ["**/*"]
  }
];

export default eslintConfig;
