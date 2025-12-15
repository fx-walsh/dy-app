-- Migration number: 0004 	 2025-12-12T12:34:14.686Z
CREATE TABLE IF NOT EXISTS page_txt_files (
    page_id VARCHAR(255) NOT NULL,
    txt_file_name VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    column_type VARCHAR(255) NOT NULL CHECK (column_type IN ('cover', 'standard', 'special')),
    page_type VARCHAR(255) NOT NULL CHECK (page_type IN ('p1', 'p2', 'cover')),
    special_name VARCHAR(255),
    column_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);