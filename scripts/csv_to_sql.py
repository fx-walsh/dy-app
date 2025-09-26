import csv
import os

# --- Configuration ---
# Define the mapping between your table names and CSV file paths
TABLE_CONFIG = {
    "page_images": {
        "csv_path": "db-seed-data/page_images.csv",
        # Columns in the order they appear in the CSV/Table
        "columns": [
            "page_id", "img_file_name", "publish_date", "column_type", 
            "page_type", "special_name", "column_id"
        ]
    },
    "columns_meta_data": {
        "csv_path": "db-seed-data/columns_meta_data.csv",
        # Columns in the order they appear in the CSV/Table
        "columns": [
            "column_id", "publish_date", "column_type", 
            "special_name", "first_img_file_name", "column_title"
        ]
    }
}

OUTPUT_SQL_FILE = "d1_seed_data.sql"
# ---------------------


def quote_value(value):
    """
    Quotes the value for SQL and converts empty strings to NULL.
    SQLite/D1 expects NULL instead of an empty string for null fields.
    """
    if value is None or str(value).strip() == "":
        return "NULL"
    
    # Escape single quotes and wrap in single quotes for SQL string literal
    return f"'{str(value).replace("'", "''")}'"

def generate_insert_statements(table_name, config, output_file):
    """
    Reads a CSV file and generates the corresponding SQL INSERT statements.
    """
    csv_path = config["csv_path"]
    
    if not os.path.exists(csv_path):
        print(f"⚠️ Warning: CSV file not found at '{csv_path}'. Skipping table '{table_name}'.")
        return

    print(f"Processing '{csv_path}' for table '{table_name}'...")
    
    columns_string = ", ".join(config["columns"])
    
    with open(csv_path, mode='r', encoding='utf-8') as csvfile:
        # Use DictReader to rely on the header row names
        reader = csv.DictReader(csvfile)
        
        insert_statements = []
        for row in reader:
            # Build the list of values, ensuring they are quoted/NULL
            # We map over the explicit list of columns in the config to maintain order
            values = [quote_value(row.get(col)) for col in config["columns"]]
            
            # Format the values list for the SQL statement
            values_string = ", ".join(values)
            
            # Construct the full INSERT statement
            sql_statement = f"INSERT INTO {table_name} ({columns_string}) VALUES ({values_string});\n"
            insert_statements.append(sql_statement)

    if insert_statements:
        output_file.write(f"\n-- Data for table: {table_name}\n")
        output_file.writelines(insert_statements)
        print(f"✅ Generated {len(insert_statements)} inserts for {table_name}.")
    else:
        print(f"ℹ️ CSV file was empty for table: {table_name}.")


def main():
    """
    Main function to orchestrate the CSV-to-SQL conversion.
    """
    # Create the db-seed-data directory if it doesn't exist (assuming you'll place CSVs there)
    os.makedirs("db-seed-data", exist_ok=True)
    
    # Write the CREATE TABLE statements first

    with open(OUTPUT_SQL_FILE, 'w', encoding='utf-8') as outfile:
        for table, config in TABLE_CONFIG.items():
            generate_insert_statements(table, config, outfile)

    print(f"\n--- Conversion Complete ---")
    print(f"The output SQL file is ready: {OUTPUT_SQL_FILE}")
    print("To execute this, use the wrangler CLI:")
    print(f"npx wrangler d1 execute dy-app-db --file {OUTPUT_SQL_FILE}")


if __name__ == "__main__":
    main()