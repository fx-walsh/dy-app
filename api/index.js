  import { Hono } from "hono";
  import columnsRouter from "./routes/columns";
  import { mockColumns } from "./lib/mockData";

  const app = new Hono();

  // Setup SQL client middleware
  app.use("*", async (c, next) => {
    
    if (c.env.PAGE_IMAGES_BUCKET) {
      console.log("pages r2 binding exists");
      console.log(c.env.PAGE_IMAGES_BUCKET)
    }
    
    // Check if D1 binding is available
    if (c.env.D1_DATABASE) { // <--- Use the D1 binding name from wrangler.jsonc
        console.log("D1 database binding available.");
        c.env.DB_AVAILABLE = true;
    } else {
        // No D1 binding available (e.g., in a limited local test environment)
        console.log("No database connection available. Using mock data.");
        c.env.DB_AVAILABLE = false;
        c.env.MOCK_DATA = mockColumns;
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

  // Worker code (api/index.js)

  // ... other routes ...

  // LAST ROUTE: Catch-all for assets and SPA routing
  // app.all("*", async (c) => {
  //     const response = await c.env.ASSETS.fetch(c.req.raw);

  //     // If the response is a 404, it means the requested file (e.g., /about, /column/123) 
  //     // was not found in the assets bundle. We serve index.html for React Router to handle it.
  //     if (response.status === 404) {
  //         // Worker code (api/index.js) - around line 75

  //         // ... inside the if (response.status === 404) block ...

  //         // 1. Get the base URL components from the current request
  //         const url = new URL(c.req.url); // Use the URL object from the Hono context

  //         // 2. Construct the absolute URL for index.html using the correct origin
  //         const indexUrl = `${url.protocol}//${url.host}/index.html`;

  //         // 3. Create a new Request object using the absolute URL
  //         const indexRequest = new Request(indexUrl, {
  //             method: 'GET'
  //             // Simplified options are best here
  //         });

  //         const indexResponse = await c.env.ASSETS.fetch(indexRequest);

  //         // ... rest of the code to handle indexResponse (return 200 or 404) ...
  //     }

  //     // Otherwise, it was a static asset (JS, CSS, Image), so return it directly.
  //     return response;
  // });

  export default {
    fetch: app.fetch,
  };
