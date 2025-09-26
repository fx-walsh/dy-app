-- Migration number: 0002 	 2025-09-26T01:21:33.856Z
CREATE TABLE IF NOT EXISTS page_images (
    page_id VARCHAR(255) NOT NULL,
    img_file_name VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    column_type VARCHAR(255) NOT NULL CHECK (column_type IN ('cover', 'standard', 'special')),
    page_type VARCHAR(255) NOT NULL CHECK (page_type IN ('p1', 'p2', 'cover')),
    special_name VARCHAR(255),
    column_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS columns_meta_data (
    column_id VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    column_type VARCHAR(255) NOT NULL CHECK (column_type IN ('cover', 'standard', 'special')),
    special_name VARCHAR(255),
    first_img_file_name VARCHAR(255) NOT NULL,
    column_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

