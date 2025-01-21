import { NextApiRequest, NextApiResponse } from "next";
import { searchMovies, getMovieCredits, Movie } from "../../lib/tmdb";
import { PositionalIndex } from "../../lib/search/PositionalIndex";
import { SpellChecker } from "../../lib/search/SpellChecker";
import { KGramIndex } from "../../lib/search/KGramIndex";

let positionalIndex: PositionalIndex;
let spellChecker: SpellChecker;
let kgramIndex: KGramIndex;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, type } = req.query;
  const query = q?.toString() || "";

  try {
    // Initialize indices on first request
    if (!positionalIndex) {
      const initialMovies = await searchMovies("");
      positionalIndex = new PositionalIndex();
      kgramIndex = new KGramIndex();
      spellChecker = new SpellChecker(initialMovies);

      initialMovies.forEach(movie => {
        positionalIndex.addDocument(movie.id, movie.overview);
        kgramIndex.addTerm(movie.title, movie.id);
      });
    }

    // Process search
    const correctedQuery = spellChecker.correct(query);
    let movieIds: number[] = [];
    let movies: Movie[] = [];

    switch (type) {
      case "phrase":
        movieIds = positionalIndex.searchPhrase(correctedQuery);
        movies = (await searchMovies(correctedQuery))
          .filter(m => movieIds.includes(m.id));
        break;

      case "wildcard":
        movieIds = kgramIndex.searchWildcard(correctedQuery);
        movies = (await searchMovies(correctedQuery))
          .filter(m => movieIds.includes(m.id));
        break;

      default:
        movies = await searchMovies(correctedQuery);
    }

    // Enrich with actor data
    const results = await Promise.all(
      movies.map(async movie => ({
        ...movie,
        actors: await getMovieCredits(movie.id),
      }))
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Search failed", details: error });
  }
}
