import { Hono } from "hono";
import { selectDataSource, bookRelatedMockUtils } from "../lib/utils.js";

// Create book related router
const bookRelatedRouter = new Hono();

// Related books endpoint
bookRelatedRouter.get("/", async (c) => {
  const columnId = c.req.param("id");

  // Use the imported mock logic
  const mockLogic = async (c) => {
    return bookRelatedMockUtils.getRelatedBookData(c, columnId);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;

    // const book = await sql`SELECT * FROM public.books WHERE id = ${bookId}`;

    let columns = await sql`
      select 
        column_id as id, 
        column_title, 
        first_img_file_name, 
        publish_date 
      from public.columns_meta_data 
      where 
        column_id = ${columnId}
        `;

    if (columns.length === 0) {
      return Response.json({ error: "Column not found" }, { status: 404 });
    }
    let column = columns[0];


    return Response.json({
      columnId: column.id,
      columnTitle: column.column_title,
      first_img_file_name: column.first_img_file_name,
      publishDate: column.publish_date,
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default bookRelatedRouter;
