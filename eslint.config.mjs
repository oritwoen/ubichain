import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    // ignore paths
  ],
  rules: {
    "unicorn/prefer-export-from": "off"
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
