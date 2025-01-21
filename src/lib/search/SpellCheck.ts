import natural from "natural";
import { Movie } from "../tmdb";

export class SpellChecker {
  private spellcheck: natural.Spellcheck;
  private dictionary: Set<string>;

  constructor(movies: Movie[]) {
    this.dictionary = this.buildDictionary(movies);
    this.spellcheck = new natural.Spellcheck(Array.from(this.dictionary));
  }

  correct(query: string): string {
    return query.split(/\s+/)
      .map(word => {
        const corrections = this.spellcheck.getCorrections(word.toLowerCase(), 1);
        return corrections[0] || word;
      })
      .join(" ");
  }

  private buildDictionary(movies: Movie[]): Set<string> {
    const dictionary = new Set<string>();
    movies.forEach(movie => {
      [movie.title, movie.overview].forEach(text => {
        text.split(/\W+/).forEach(word => dictionary.add(word.toLowerCase()));
      });
    });
    return dictionary;
  }
}
