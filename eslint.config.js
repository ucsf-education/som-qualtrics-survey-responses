import globals from "globals";
import js from "@eslint/js";

export default [js.configs.recommended, {
  languageOptions: {
    globals: {
      ...globals.node,
    },

    ecmaVersion: 2022,
    sourceType: "module",
  },

  rules: {
    "comma-dangle": [2, "only-multiline"],
    radix: [2, "always"],
    indent: [2, 2],
    semi: 2,
    camelcase: 2,
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],

    "no-multiple-empty-lines": ["error", {
      max: 2,
      maxEOF: 1,
      maxBOF: 0,
    }],

    curly: ["error", "all"],
    "sort-imports": 2,
    "prefer-const": "error",
  },
}];
