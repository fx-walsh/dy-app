import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ColumnCard from "./ColumnCard";

function useColumns(filter, sortBy) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append("genre", filter);
        if (sortBy) params.append("sort", sortBy);

        const url = `/api/columns${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.columns?.length) {
          console.error("No columns data found:", data);
          setColumns([]);
        } else {
          setColumns(data.columns);
        }
      } catch (error) {
        console.error("Error loading columns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [filter, sortBy]);

  return { columns, loading };
}

function ColumnsList({ filter, onSelectColumn }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("");
  const { columns, loading } = useColumns(filter, sortBy);

  const handleColumnSelect = (bookId) => {
    onSelectColumn ? onSelectColumn(bookId) : navigate(`/column/${bookId}`);
  };
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          className="py-2 px-4 border border-gray-300 rounded-md bg-white"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="">Sort by...</option>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
          <option value="publish_date_asc">Publish Date (earliest first)</option>
          <option value="publish_date_desc">Publish Date (latest first)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {columns.map((book) => (
          <ColumnCard
            key={book.id}
            book={book}
            onClick={() => handleColumnSelect(book.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default ColumnsList;
