import { useState, useEffect, useRef } from "react";
import './Search.css';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchMovies = async () => {
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        type: searchType,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') searchMovies();
  };

  const handleSearchTypeChange = (type: "fuzzy" | "phrase" | "wildcard") => {
    setSearchType(type);
  };

  return (
    <div className="google-style-container">
      {/* Google-like Header */}
      <div className="search-header">
        <div className="logo">
          <span className="blue">M</span>
          <span className="red">o</span>
          <span className="yellow">v</span>
          <span className="blue">i</span>
          <span className="green">e</span>
          <span className="red">Search</span>
        </div>
      </div>

      {/* Search Container */}
      <div className="search-container">
        <div className="search-box">
          <div className="search-input">
            <svg className="search-icon" focusable="false" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === "wildcard" ? "Try 'star*' or '*force'" :
                searchType === "phrase" ? 'Try "may the force"' :
                "Search movies..."
              }
            />
            {isLoading && (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {/* Search Type Toggles - Google-style */}
          <div className="search-types">
            {(["fuzzy", "phrase", "wildcard"] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleSearchTypeChange(type)}
                className={`search-type ${searchType === type ? 'active' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="search-results">
          {results.map((movie) => (
            <div key={movie.id} className="result-item">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                />
              )}
              <div className="result-content">
                <h3 className="result-title">{movie.title}</h3>
                <div className="result-metadata">
                  <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                  <span className="rating">★ {movie.vote_average}</span>
                  <span className="search-type-indicator">{searchType}</span>
                </div>
                <p className="result-snippet">{movie.overview.substring(0, 150)}...</p>
                <div className="actors">
                  {movie.actors?.slice(0, 3).map((actor) => (
                    <span key={actor} className="actor-tag">👤 {actor}</span>
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
