import { useState } from 'react';

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [searchType, setSearchType] = useState<
    'phrase' | 'wildcard' | 'fuzzy'
  >('fuzzy');

  const searchMovies = async () => {
    const params = new URLSearchParams({
      q: query,
      type: searchType,
    });

    try {
      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search movies by quotes, actors, or genres..."
          />
          <button
            onClick={searchMovies}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(['fuzzy', 'phrase', 'wildcard'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded capitalize ${
                searchType === type
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {type} Search
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {results.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-lg shadow-sm p-4 border"
            >
              <div className="flex gap-4">
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    className="w-32 h-48 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
                  <p className="text-gray-600 text-sm mb-3">{movie.overview}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      🎬 {new Date(movie.release_date).getFullYear()}
                    </span>
                    <span className="bg-yellow-100 px-2 py-1 rounded text-xs">
                      ★ {movie.vote_average}
                    </span>
                    {movie.actors?.map((actor) => (
                      <span
                        key={actor}
                        className="bg-blue-100 px-2 py-1 rounded text-xs"
                      >
                        👤 {actor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
