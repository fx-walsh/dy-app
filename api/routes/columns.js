import { Hono } from "hono";
import { selectDataSource, columnsMockUtils } from "../lib/utils.js";

// Create columns router
const columnsRouter = new Hono();

// Column list endpoint with filtering and sorting
columnsRouter.get("/", async (c) => {
  console.log("hitting columns endpoints")
  const { genre, sort } = c.req.query();

  // Use imported mock logic
  const mockLogic = async (c) => {
    return columnsMockUtils.getColumnsList(c, genre, sort);
  };

  // Database logic
  const dbLogic = async (c) => {
    // 1. Get the D1 database binding
    const db = c.env.D1_DATABASE;

    // 2. Determine the order column and direction
    let orderColumn = "publish_date";
    let orderDirection = "ASC"; // Default order

    if (sort) {
        switch (sort) {
            case "title_asc":
                orderColumn = "column_title";
                orderDirection = "ASC";
                break;
            case "title_desc":
                orderColumn = "column_title";
                orderDirection = "DESC";
                break;
            case "publish_date_asc":
                orderColumn = "publish_date";
                orderDirection = "ASC";
                break;
            case "publish_date_desc":
                orderColumn = "publish_date";
                orderDirection = "DESC";
                break;
            default:
                // Use default if sort param is invalid
                break;
        }
    }

    // 3. Construct the SQL string using string interpolation for the ORDER BY clause.
    // NOTE: Since the column names and directions come from a trusted 'switch' block,
    // using string interpolation here is safe and standard for D1/SQLite dynamic ORDER BY.
    const sqlQuery = `
        SELECT 
            column_id AS id, 
            column_title, 
            first_img_file_name, 
            publish_date 
        FROM columns_meta_data 
        WHERE 
            column_type != 'cover'
        ORDER BY ${orderColumn} ${orderDirection} 
    `;

    // 4. Execute the query using the D1 API
    // Since there are no WHERE clause parameters (placeholders), we skip the .bind() call.
    let { results: res } = await db
        .prepare(sqlQuery)
        .all();

    // The res variable now holds the array of results
    
    let cleanRes = res.map((item) => { // NOTE: map is now synchronous!
    const filename = item.first_img_file_name;
    
      // ⚠️ IMPORTANT: Replace this placeholder with your actual R2 public URL base.
      // Example: https://pub-xxxxxxxxxxxxxxxx.r2.dev/ or your custom domain
      const R2_PUBLIC_URL_BASE = c.env.R2_PUBLIC_URL; // Assuming you set this env var
        return {
            ...item, 
            author: "Frank Walsh", 
            // 1. Provide the direct public URL for the client to fetch.
            image_url: `${R2_PUBLIC_URL_BASE}/${filename}`, 
            
            // 2. Remove the Base64 fetching logic (r2_obj.arrayBuffer, base64String).
            // The API response is now tiny and fast!
            // image_data_base64: null, 

            publish_date_display: new Date(item.publish_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
        };
    });

    console.log(JSON.stringify(cleanRes));

    // The result is already 'cleanRes', no need for Promise.all, as map is synchronous.
    return Response.json({
        columns: cleanRes,
        source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

// Column details endpoint
columnsRouter.get("/:id", async (c) => {
  const columnId = c.req.param("id");

  // Use imported mock logic
  const mockLogic = async (c) => {
    return columnsMockUtils.getColumnDetail(c, bookId);
  };

  // Database logic
  const dbLogic = async (c) => {
    // Get the D1 database binding directly from the environment
  const db = c.env.D1_DATABASE;

  // The SQL query string remains the same, but it's now a standard string literal
  const sqlQuery = `
      SELECT 
          cmd.column_id AS id, 
          cmd.column_title, 
          cmd.first_img_file_name,
          pi.img_file_name AS page_img_file_name, 
          cmd.publish_date 
      FROM columns_meta_data AS cmd
      INNER JOIN page_images AS pi
        ON
          cmd.column_id = pi.column_id
      WHERE 
          cmd.column_id = ?
      ORDER BY cmd.column_id, pi.page_type
  `;

  // Execute the query using the D1 API
  let { results: columns } = await db
      .prepare(sqlQuery) // 1. Pass the SQL string to prepare()
      .bind(columnId)    // 2. Bind the parameter(s) using ? placeholders
      .all();            // 3. Execute and get all results

  // The columns variable now holds the array of results
    if (columns.length === 0) {
      return Response.json({ error: "Column not found" }, { status: 404 });
    }

    const R2_PUBLIC_URL_BASE = c.env.R2_PUBLIC_URL;
    
    let cleanColumns = columns.map((res) => ({
      ...res, 
      author: "Frank Walsh", 
      image_url: `${R2_PUBLIC_URL_BASE}/${res.page_img_file_name}`,
      publish_date_display: new Date(res.publish_date).toLocaleDateString('en-US', {
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

export default columnsRouter;
