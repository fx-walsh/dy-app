module.exports = {
  modules: true,              // use ES modules Workers format
  sourceMap: true,
  r2: [
    {
      binding: "PAGE_IMAGES_BUCKET",
      bucket: "./local-r2/dy-page-images/",   // local folder for objects
    }
  ],
  watch: true,                // auto-reload on changes
  bindings: {
    // any environment variables for dev
    MY_VAR: "dev_value"
  },
  port: 8787                  // optional, where Miniflare serves the Worker
};
