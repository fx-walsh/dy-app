import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { groupByGenre } from "./lib/utils";
import Breadcrumbs from "./components/Breadcrumbs";
import Sidebar from "./components/Sidebar";
import ColumnsList from "./components/ColumnsList";
import ColumnDetail from "./components/ColumnDetail";
import MockDataBanner from "./components/MockDataBanner";

function App() {
  const navigate = useNavigate();
  const params = useParams();
  const [bookDetail, setColumnDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [dataSource, setDataSource] = useState(null);

  // Get route parameters
  const { bookId } = params;
  const { genreId } = params;
  const activeGenre = genreId ? decodeURIComponent(genreId) : null;

  // Load genres for sidebar
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await fetch("/api/columns");
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.columns?.length) {
          console.error("No columns data found:", typeof data);
          return;
        }

        const booksArray = data.columns;

        // Check if using mock data or database
        if (data.source) {
          setDataSource(data.source);
        }

        const genreGroups = groupByGenre(booksArray);
        setGenres(genreGroups);
      } catch (error) {
        console.error("Error loading genres:", error);
      }
    };

    loadGenres();
  }, []);

  // Load book details when a book is selected via URL
  useEffect(() => {
    if (!bookId) return;

    const fetchColumnDetail = async () => {
      setLoading(true);
      try {
        // First get basic book details
        const columnResponse = await fetch(`/api/columns/${bookId}`);

        if (!columnResponse.ok) {
          throw new Error(`API returned status: ${columnResponse.status}`);
        }

        const columnData = await columnResponse.json();

        // Combine the data
        const combinedData = {
          column: columnData,
        };

        setColumnDetail(combinedData);
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColumnDetail();
  }, [bookId]);

  const handleSelectColumn = (bookId) => {
    navigate(`/column/${bookId}`);
  };

  const handleSelectGenre = (genre) => {
    if (genre) {
      navigate(`/genre/${encodeURIComponent(genre)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="layout">
      <Sidebar
        genres={genres}
        activeGenre={activeGenre}
        onSelectGenre={handleSelectGenre}
        counts
      />

      <main className="main-content">
        {/* Breadcrumbs for main library page */}
        {!bookId && (
          <Breadcrumbs
            items={[
              { label: "All Columns", value: null },
              ...(activeGenre
                ? [{ label: activeGenre, value: activeGenre }]
                : []),
            ]}
            onNavigate={(value) => {
              if (value === null) {
                handleSelectGenre(null);
              }
            }}
          />
        )}

        <div className="page-header">
          <h1>{activeGenre ? `${activeGenre} Columns` : "Damn Yankee Columns"}</h1>
          {/* Show banner only when using mock data */}
          {dataSource === "mock" && <MockDataBanner />}
        </div>

        {bookId ? (
          loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bookDetail ? (
            <ColumnDetail bookData={bookDetail} />
          ) : (
            <div className="text-center py-20 text-gray-600">
              Error loading book details
            </div>
          )
        ) : (
          <ColumnsList onSelectColumn={handleSelectColumn} filter={activeGenre} />
        )}
      </main>
    </div>
  );
}

export default App;
