import { NextApiRequest, NextApiResponse } from "next";
import { searchMovies, getMovieCredits, Movie } from "../../lib/tmdb";
import { PositionalIndex } from "../../lib/search/PositionalIndex";
import { SpellChecker } from "../../lib/search/SpellCheck";
import { KGramIndex } from "../../lib/search/KGramIndex";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, type } = req.query;

  try {
    // Always start with a fuzzy search to get base results
    const correctedQuery = new SpellChecker([]).correct(q as string);
    const baseMovies = await searchMovies(correctedQuery);

    // Initialize indices with the CURRENT search results
    const positionalIndex = new PositionalIndex();
    const kgramIndex = new KGramIndex();
    const spellChecker = new SpellChecker(baseMovies);

    baseMovies.forEach(movie => {
      positionalIndex.addDocument(movie.id, movie.overview);
      kgramIndex.addTerm(movie.title, movie.id);
    });

    let filteredMovies: Movie[] = [];

    switch (type) {
      case "phrase":
        const phraseIds = positionalIndex.searchPhrase(correctedQuery);
        filteredMovies = baseMovies.filter(m => phraseIds.includes(m.id));
        break;

      case "wildcard":
        const wildcardIds = kgramIndex.searchWildcard(correctedQuery);
        filteredMovies = baseMovies.filter(m => wildcardIds.includes(m.id));
        break;

      default:
        filteredMovies = baseMovies;
    }

    // Enrich with actor data
    const results = await Promise.all(
      filteredMovies.map(async movie => ({
        ...movie,
        actors: await getMovieCredits(movie.id),
      }))
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
}
