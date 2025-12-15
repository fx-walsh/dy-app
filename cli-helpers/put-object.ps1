# Set expires to a valid, far-future date string (e.g., ISO 8601 format)
npx wrangler r2 object put dy-page-txt-files-dev/20040305_p1.txt `
--file ..\damn-yankee-data\page-images-cropped\text\20040305_p1.txt `
--env development `
--content-type "text/plain" `
--cache-control "public, max-age=31536000"