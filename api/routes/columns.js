import { Hono } from "hono";
import { selectDataSource, columnsMockUtils } from "../lib/utils.js";


/**
 * Reads the text content of a single object from the PAGE_TXT_FILES R2 bucket.
 * @param {string} objectPath The key/path of the object in the R2 bucket (e.g., '20040305_p1.txt').
 * @param {object} env The environment object passed to the Worker, containing R2 bindings.
 * @returns {Promise<string|null>} The text content of the object, or null if the object is not found.
 */
async function getR2TextFileContent(objectPath, env) {
  // The binding name is 'PAGE_TXT_FILES' as defined in your wrangler.jsonc
  const bucket = env.PAGE_TXT_FILES;

  if (!bucket) {
    console.error("R2 binding PAGE_TXT_FILES not found in environment.");
    return null;
  }

  try {
    const object = await bucket.get(objectPath);

    if (object === null) {
      console.warn(`R2 object not found at path: ${objectPath}`);
      return null;
    }

    // Read the object content as text
    const textContent = await object.text();
    return textContent;

  } catch (error) {
    console.error(`Error reading R2 object at path ${objectPath}:`, error);
    return null;
  }
}


/**
 * Fetches and combines the text content of multiple R2 files based on D1 results.
 * * @param {Array<object>} columnsD1Results The array of rows returned from the D1 query.
 * @param {object} env The environment object containing R2 bindings.
 * @returns {Promise<string>} A single string containing all combined file content, separated by two newlines.
 */
async function combineR2TextFiles(columnsD1Results, env) {
    // 1. Get the list of unique R2 text file paths
    // We filter out nulls/duplicates and map to an array of just the file names.
    const txtFileNames = columnsD1Results
      .map(row => row.txt_file_name)
      .filter((name, index, self) => name && self.indexOf(name) === index); // Filter unique, truthy file names

    // 2. Create an array of Promises to fetch all text files concurrently
    const fileContentPromises = txtFileNames.map(fileName => 
      getR2TextFileContent(fileName, env)
    );

    // 3. Wait for all files to be fetched simultaneously
    const allFileContents = await Promise.all(fileContentPromises);

    // 4. Combine the results, filtering out nulls (files not found) and joining with the separator
    const combinedTextContent = allFileContents
      .filter(content => content !== null) // Ignore files that failed to load (returned null)
      .join('\n\n'); // Separated by two new lines

    return combinedTextContent;
}



// Create columns router
const columnsRouter = new Hono();

// Column list endpoint with filtering and sorting
columnsRouter.get("/", async (c) => {
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
    const originalFilename = item.first_img_file_name;
    const parts = originalFilename.split('.');
    const extension = parts.pop(); // Removes and stores the last part (e.g., "png")
    const baseName = parts.join('.'); // Joins the rest back (e.g., "book-cover-123")

    // 3. Add the suffix and combine them
    const thumbnailFilename = `${baseName}_thumbnail.${extension}`;

  
    const R2_PUBLIC_URL_BASE = c.env.R2_PUBLIC_URL; // Assuming you set this env var
      return {
          ...item, 
          author: "Frank Walsh", 
          // Provide the direct public URL for the client to fetch.
          image_url: `${R2_PUBLIC_URL_BASE}/${thumbnailFilename}`, 
          publish_date_display: new Date(item.publish_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
          }),
      };
    });

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
          cmd.publish_date,
          pt.txt_file_name
      FROM columns_meta_data AS cmd
      INNER JOIN page_images AS pi
        ON
          cmd.column_id = pi.column_id
      LEFT JOIN page_txt_files as pt
        ON
          cmd.column_id = pt.column_id
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
    const combinedTextContent = await combineR2TextFiles(columns, c.env);
    
    let cleanColumns = columns.map((res) => ({
      ...res, 
      author: "Frank Walsh", 
      image_url: `${R2_PUBLIC_URL_BASE}/${res.page_img_file_name}`,
      publish_date_display: new Date(res.publish_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }))

    console.log("returning column details respsone");
    return Response.json({
      ...cleanColumns[0],
      image_urls: cleanColumns.map((res) => (res.image_url)),
      source: "database",
      text_content: combinedTextContent, 
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default columnsRouter;
