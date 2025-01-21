import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path?: string;
}

export interface MovieCredit {
  cast: Array<{ name: string }>;
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: TMDB_API_KEY,
      query,
      include_adult: false,
    },
  });
  return response.data.results;
};

export const getMovieCredits = async (movieId: number): Promise<string[]> => {
  const response = await axios.get<MovieCredit>(
    `${BASE_URL}/movie/${movieId}/credits`,
    { params: { api_key: TMDB_API_KEY } }
  );
  return response.data.cast.slice(0, 5).map(actor => actor.name);
};
