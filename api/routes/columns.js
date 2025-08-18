import { Hono } from "hono";
import { selectDataSource, booksMockUtils } from "../lib/utils.js";

// Create books router
const booksRouter = new Hono();

// Books list endpoint with filtering and sorting
booksRouter.get("/", async (c) => {
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
    const result = await query; // Example: assuming you're within an async function

    let res = await query;
    let cleanRes = res.map((res) => ({
      ...res, 
      author: "Frank Walsh", 
      image_url: `/images/page-images/${res.first_img_file_name}`,
      publish_date_display: res.publish_date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    }))

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
