import path from "node:path";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const headerPlugin = {
  rules: {
    "path-header": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          missing: "The first line must be the comment {{expected}}.",
        },
      },
      create(context) {
        return {
          Program(node) {
            const relative = path
              .relative(context.cwd, context.filename)
              .split(path.sep)
              .join("/");
            const expected = `// ${relative}`;
            const firstLine = context.sourceCode.getText().split(/\r?\n/, 1)[0];
            if (firstLine !== expected) {
              context.report({
                node,
                loc: { line: 1, column: 0 },
                messageId: "missing",
                data: { expected },
              });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "playwright-report",
      "test-results",
      "node_modules",
      "docs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: [
      "src/**/*.{ts,tsx}",
      "scripts/**/*.ts",
      "tests/**/*.{ts,tsx}",
      "e2e/**/*.ts",
    ],
    plugins: { header: headerPlugin },
    rules: { "header/path-header": "error" },
  },
);
