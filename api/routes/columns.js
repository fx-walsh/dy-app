import { Hono } from "hono";
import { selectDataSource, booksMockUtils } from "../lib/utils.js";

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Create books router
const booksRouter = new Hono();

// Books list endpoint with filtering and sorting
booksRouter.get("/", async (c) => {
  console.log("hitting columns endpoints")
  const { genre, sort } = c.req.query();

  // Use imported mock logic
  const mockLogic = async (c) => {
    return booksMockUtils.getBooksList(c, genre, sort);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;

    let order = {publish_date: "asc"};
    if (sort) {
      switch (sort) {
        case "title_asc":
          // Notice how the entire query, including the ordering, is within the sql`` tag.
          order = {column_title: "asc"};
          break;
        case "title_desc":
          order = {column_title: "desc"};
          break;
        case "publish_date_asc":
          order = {publish_date: "asc"};
          break;
        case "publish_date_desc":
          order = {publish_date: "desc"};
        default:
          break;
      }
    }

  
    let query = sql`
      select 
        column_id as id, 
        column_title, 
        first_img_file_name, 
        publish_date 
      from public.columns_meta_data 
      where 
        column_type != 'cover'
      order by ${
        Object.entries(order).flatMap(([column, order], i) =>
          [i ? sql`,` : sql``, sql`${ sql(column) } ${ order === 'desc' ? sql`desc` : sql`asc` }`]
        )
      }  
        `;

    // Then execute the query (you'll need to await the promise)
    let res = await query;
    
    let cleanRes = await Promise.all(res.map(async (item) => {
      const filename = item.first_img_file_name;
      console.log(`Getting R2 file: ${filename}`);

      // Fetch the R2 object
      const r2_obj = await c.env.PAGE_IMAGES_BUCKET.get(filename);

      // Check if the object exists
      if (!r2_obj) {
          return {
              ...item,
              author: "Frank Walsh",
              image_url: `/images/page-images/${filename}`,
              publish_date_display: item.publish_date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              }),
              // Use a placeholder or null if the file isn't found
              image_data_base64: null, 
          };
      }

      console.log(`file was found ${filename}`)
      // Convert the R2 object body (a ReadableStream) into a Base64 string
      const arrayBuffer = await r2_obj.arrayBuffer();
      
      // Note: The below conversion requires a runtime that supports Buffer or TextEncoder/Decoder, 
      // which Workers/Cloudflare often provide globally or via specific APIs.
      // In a Cloudflare Worker, you can often use the global Buffer or dedicated APIs.
      // We'll use the standard Web API way with the global `btoa` if the bytes are small, 
      // or TextEncoder/Decoder for more robust binary-to-string conversion. 
      
      // For a robust solution in Cloudflare Workers, you might need a helper function 
      // to handle ArrayBuffer to Base64 conversion, as the global `btoa` is for strings.
      // The most reliable way is often to use a library or a well-tested function.

      // A common helper function for Workers:
      const base64String = arrayBufferToBase64(arrayBuffer);

      return {
          ...item, 
          author: "Frank Walsh", 
          // This is a relative path to the image, useful if you're serving the image separately
          image_url: `/images/page-images/${filename}`, 
          publish_date_display: item.publish_date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          }),
          // Send the actual image data as a Data URL (Base64 encoded string)
          image_data_base64: `data:image/png;base64,${base64String}`,
          // Optionally include metadata
          image_contentType: r2_obj.httpMetadata?.contentType || 'image/png'
      };
  }));

    // Return results
    return Response.json({
      books: cleanRes,
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

// Book details endpoint
booksRouter.get("/:id", async (c) => {
  const columnId = c.req.param("id");

  // Use imported mock logic
  const mockLogic = async (c) => {
    return booksMockUtils.getBookDetail(c, bookId);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;

    let columns = await sql`
      select 
        cmd.column_id as id, 
        cmd.column_title, 
        cmd.first_img_file_name,
        pi.img_file_name as page_img_file_name, 
        cmd.publish_date 
      from public.columns_meta_data as cmd
      inner join public.page_images as pi
        on
          cmd.column_id = pi.column_id
      where 
        cmd.column_id = ${columnId}
      order by cmd.column_id, pi.page_type
        `;

    if (columns.length === 0) {
      return Response.json({ error: "Column not found" }, { status: 404 });
    }
    
    let cleanColumns = columns.map((res) => ({
      ...res, 
      author: "Frank Walsh", 
      image_url: `/images/page-images/${res.page_img_file_name}`,
      publish_date_display: res.publish_date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    }))

    return Response.json({
      ...cleanColumns[0],
      image_urls: cleanColumns.map((res) => (res.image_url)),
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default booksRouter;
