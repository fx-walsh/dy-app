  import { Hono } from "hono";
  import columnsRouter from "./routes/columns";

  const app = new Hono();

  // Setup SQL client middleware
  app.use("*", async (c, next) => {
    
    if (c.env.PAGE_IMAGES_BUCKET) {
      console.log("pages r2 binding exists");
      console.log(c.env.PAGE_IMAGES_BUCKET)
    }

    if (c.env.PAGE_TXT_FILES) {
      console.log("pages txt files r2 binding exists");
      console.log(c.env.PAGE_TXT_FILES)
    }
    
    // Check if D1 binding is available
    if (c.env.D1_DATABASE) { // <--- Use the D1 binding name from wrangler.jsonc
        console.log("D1 database binding available.");
        c.env.DB_AVAILABLE = true;
    } else {
        // No D1 binding available (e.g., in a limited local test environment)
        console.log("No database connection available.");
        c.env.DB_AVAILABLE = false;
        throw new Error("No database connection available.")
    }

    // Process the request
    await next();
  });

  app.route("/api/columns", columnsRouter);
  // Example addition to your main Worker file (api/index.js)

  // ... existing code ...

  // Helper function to handle R2 fetching and serving
  app.get("/images/:filename", async (c) => {
      const filename = c.req.param('filename');
      const r2_obj = await c.env.PAGE_IMAGES_BUCKET.get(filename);
      if (r2_obj === null) {
          return c.notFound();
      }

      // Return the R2 object directly as a Response!
      // This is the fastest way to serve R2 content.
      return new Response(r2_obj.body, {
          headers: {
              "Content-Type": r2_obj.httpMetadata.contentType || "application/octet-stream",
              "ETag": r2_obj.httpEtag,
              "Cache-Control": "public, max-age=31536000, immutable" // Highly recommend caching images
          }
      });
  });

  // ... rest of your code ...

  // Catch-all route for static assets
  app.all("*", async (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
  });


  export default {
    fetch: app.fetch,
  };
