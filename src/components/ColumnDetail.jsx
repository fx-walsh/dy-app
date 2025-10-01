import { useNavigate } from "react-router";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";
import Breadcrumbs from "./Breadcrumbs";

function ColumnDetail({ bookData }) {
  const navigate = useNavigate();
  const { column } = bookData;

  // Handle multiple images
  const images = column.image_urls && column.image_urls.length > 0 
    ? column.image_urls
    : [column.image_url]; // fallback to single image

  const [currentPage, setCurrentPage] = useState(0);

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

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} onNavigate={handleNavigate} />

      <div className="space-y-6 mt-6">
        <div className="card p-6">
          {/* Title & Author */}
          <h1 className="mb-3 text-2xl font-bold">{column.column_title}</h1>
          <h2 className="text-lg text-gray-700 mb-6 font-serif">
            by {column.author}
          </h2>

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

          {/* Image Viewer with navigation */}
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

          {/* Description */}
          <p className="text-gray-900 leading-relaxed mt-6">
            {column.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ColumnDetail;
