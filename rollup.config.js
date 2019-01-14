export default {
  input: "src/index.js",
  output: {
    file: "index.js",
    format: "esm"
  },
  external: ["dropbox", "isomorphic-fetch"]
};
