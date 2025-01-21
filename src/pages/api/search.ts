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
    // Initial search with raw query to get base movies
    const baseMovies = await searchMovies(q as string);
    const positionalIndex = new PositionalIndex();
    const kgramIndex = new KGramIndex();

    // Build indices from search results
    baseMovies.forEach(movie => {
      positionalIndex.addDocument(movie.id, movie.overview);
      kgramIndex.addTerm(movie.title, movie.id);
    });

    console.log("Search Type:", type);
    console.log("Raw Query:", q);

    let filteredMovies: Movie[] = [];

    switch (type) {
      case "phrase":
        // Remove quotes and search exact phrase
        const rawPhrase = (q as string).replace(/"/g, '');
        const phraseIds = positionalIndex.searchPhrase(rawPhrase);
        console.log("Phrase IDs:", phraseIds);
        filteredMovies = baseMovies.filter(m => phraseIds.includes(m.id));
        break;

      case "wildcard":
        // Keep asterisks for wildcard pattern matching
        const wildcardPattern = q as string;
        const wildcardIds = kgramIndex.searchWildcard(wildcardPattern);
        console.log("Wildcard IDs:", wildcardIds);
        filteredMovies = baseMovies.filter(m => wildcardIds.includes(m.id));
        break;

      default: // fuzzy
        const correctedQuery = new SpellChecker(baseMovies).correct(q as string);
        console.log("Corrected Query:", correctedQuery);
        filteredMovies = await searchMovies(correctedQuery);
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
