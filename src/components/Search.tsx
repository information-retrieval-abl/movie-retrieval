import { useState, useEffect, useRef } from "react";
import './Search.css'; // Create this CSS file


interface MovieResult {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  actors: string[];
  poster_path?: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [searchType, setSearchType] = useState<"fuzzy" | "phrase" | "wildcard">("fuzzy");
  const [isLoading, setIsLoading] = useState(false);
  const searchTypeRef = useRef(searchType);
  const queryRef = useRef(query);

  // Keep refs in sync with state
  useEffect(() => {
    searchTypeRef.current = searchType;
    queryRef.current = query;
  }, [searchType, query]);

  const handleSearchTypeChange = (type: "fuzzy" | "phrase" | "wildcard") => {
    setSearchType(type);

    // Clean query based on search type
    const cleanedQuery = queryRef.current
      .replace(type === "wildcard" ? /"/g : /\*/g, '')
      .replace(type === "phrase" ? /\*/g : /"/g, '');

    // Auto-add * for wildcard if empty
    const newQuery = type === "wildcard" && !cleanedQuery.includes('*')
      ? cleanedQuery + '*'
      : cleanedQuery;

    setQuery(newQuery);

    // Trigger search immediately with updated params
    if (newQuery.trim()) {
      searchMovies(newQuery, type);
    }
  };

  const searchMovies = async (customQuery?: string, customType?: "fuzzy" | "phrase" | "wildcard") => {
    const currentQuery = customQuery || queryRef.current;
    const currentType = customType || searchTypeRef.current;

    if (!currentQuery.trim()) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: currentQuery,
        type: currentType,
      });

      console.log("Search Type:", currentType);
      console.log("API Params:", params.toString());

      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();

      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === "wildcard" ? "Try 'star*' or '*force'" :
              searchType === "phrase" ? 'Try "may the force"' :
              "Search movies..."
            }
          />
          <button
            onClick={() => searchMovies()}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="search-types">
          {(["fuzzy", "phrase", "wildcard"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleSearchTypeChange(type)}
              className={searchType === type ? "active" : ""}
            >
              {type} Search
            </button>
          ))}
        </div>

        <div className="results-grid">
          {results.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                />
              )}
              <div className="movie-info">
                <h2>{movie.title}</h2>
                <p>{movie.overview}</p>
                <div className="movie-meta">
                  <span className="year">
                    🎬 {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="rating">
                    ★ {movie.vote_average}
                  </span>
                  {movie.actors?.map((actor) => (
                    <span key={actor} className="actor">
                      👤 {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
