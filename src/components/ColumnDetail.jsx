import { useNavigate } from "react-router";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";
import Breadcrumbs from "./Breadcrumbs";

const VIEW_MODE = {
  IMAGE: "image",
  TEXT: "text",
};

function ColumnDetail({ columnData }) {
  const navigate = useNavigate();
  const { column } = columnData;

  console.log("TEXT CONTENT!!!!!!!!!!")
  console.log(column.text_content);

  // Handle multiple images
  const images = column.image_urls && column.image_urls.length > 0 
    ? column.image_urls
    : [column.image_url]; // fallback to single image

  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState(VIEW_MODE.IMAGE);

  const breadcrumbItems = [{ label: "All Columns", value: null }];
  breadcrumbItems.push({ label: column.column_title, value: "column" });

  const handleNavigate = (value) => {
    if (value === null) {
      navigate("/");
    } else if (value !== "book") {
      navigate(`/genre/${encodeURIComponent(value)}`);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % images.length);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleToggle = () => {
    setViewMode((prev) => 
      prev === VIEW_MODE.IMAGE ? VIEW_MODE.TEXT : VIEW_MODE.IMAGE
    );
  };

  const hasTextContent = !!column.text_content;

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} onNavigate={handleNavigate} />

      <div className="space-y-6 mt-6">
        <div className="card p-6">
          {/* Title, Author, and Toggle Container */}
          <h1 className="mb-3 text-2xl font-bold">{column.column_title}</h1>
          
          {/* 2. Use flex container to put author and toggle on the same line */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg text-gray-700 font-serif m-0">
              by {column.author}
            </h2>

            {/* The Toggle Component - only show if text content is available */}
            {hasTextContent && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className={viewMode === VIEW_MODE.IMAGE ? "font-bold text-gray-900" : ""}>
                  Image View
                </span>
                <button 
                  onClick={handleToggle}
                  aria-checked={viewMode === VIEW_MODE.TEXT}
                  role="switch"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    viewMode === VIEW_MODE.TEXT ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      viewMode === VIEW_MODE.TEXT ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={viewMode === VIEW_MODE.TEXT ? "font-bold text-gray-900" : ""}>
                  Text View
                </span>
              </div>
            )}
          </div>
          {/* End of Title/Author/Toggle Container */}


          {/* Genre */}
          {column.genre && (
            <div className="mb-6">
              <span
                className="inline-block border border-blue-800 text-blue-800 text-sm px-3 py-1 rounded-full font-sans cursor-pointer"
                onClick={() =>
                  navigate(`/genre/${encodeURIComponent(column.genre)}`)
                }
              >
                {column.genre}
              </span>
            </div>
          )}

          {/* 3. Conditional Rendering based on viewMode */}
          {viewMode === VIEW_MODE.IMAGE ? (
            /* --- Image Viewer with navigation (Existing Code) --- */
            <>
              <div className="relative w-full h-[80vh] border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <TransformWrapper>
                  <TransformComponent>
                    <img
                      src={images[currentPage]}
                      alt={`${column.column_title} - Page ${currentPage + 1}`}
                      className="max-h-[80vh] object-contain"
                      loading="lazy"
                    />
                  </TransformComponent>
                </TransformWrapper>

                {/* Prev Button */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-3 hover:bg-gray-100"
                    >
                      ◀
                    </button>
                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-3 hover:bg-gray-100"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              {/* Page indicator */}
              {images.length > 1 && (
                <p className="mt-4 text-center text-sm text-gray-600">
                  Page {currentPage + 1} of {images.length}
                </p>
              )}
            </>
          ) : (
            /* --- Text Content View (New Block) --- */
            <div className="p-4 border rounded-lg bg-white shadow-inner min-h-[50vh]">
              {column.text_content ? (
                // Assuming column.text_content is a string, perhaps with line breaks
                // You might need to use a library like 'markdown-to-jsx' or 'dangerouslySetInnerHTML' 
                // if the text contains complex formatting. For simple line breaks:
                column.text_content.split('\n').map((line, index) => (
                  <p key={index} className="text-gray-900 leading-relaxed mb-4 whitespace-pre-wrap">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-center py-10">
                  Text content for this column is not available.
                </p>
              )}
            </div>
          )}

          {/* Description - This stays outside the viewMode conditional, assuming it's always shown */}
          <p className="text-gray-900 leading-relaxed mt-6">
            {column.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ColumnDetail;
