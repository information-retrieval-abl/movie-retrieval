// export class KGramIndex {
//     private index: Map<string, Set<number>> = new Map();
//     private movieTitles: Map<number, string> = new Map(); // Add this line

//     private k = 3;

//     addTerm(term: string, movieId: number) {
//       const normalized = term.toLowerCase();
//       for (let i = 0; i <= normalized.length - this.k; i++) {
//         const gram = normalized.substring(i, i + this.k);
//         if (!this.index.has(gram)) this.index.set(gram, new Set());
//         this.index.get(gram)?.add(movieId);
//       }
//     }

//     // searchWildcard(pattern: string): number[] {
//     //   const wildcardRegex = new RegExp(`^${pattern.toLowerCase().replace(/\*/g, ".*")}$`);
//     //   const prefix = pattern.split('*')[0];
//     //   const grams = this.getPrefixGrams(prefix);

//     //   const candidates = new Set<number>();
//     //   grams.forEach(gram => {
//     //     this.index.get(gram)?.forEach(movieId => candidates.add(movieId));
//     //   });

//     //   return Array.from(candidates).filter(id =>
//     //     wildcardRegex.test(this.getOriginalTerm(id) || "")
//     //   );
//     // }
//     searchWildcard(pattern: string): number[] {
//         // Add wildcard pattern validation
//         if (!pattern.includes('*')) return [];

//         const wildcardRegex = new RegExp(
//           `^${pattern.toLowerCase().replace(/\*/g, ".*")}$`
//         );

//         // Search through all known titles
//         const results = new Set<number>();
//         this.movieTitles.forEach((title, id) => {
//           if (wildcardRegex.test(title)) results.add(id);
//         });

//         return Array.from(results);
//       }

//     private getPrefixGrams(prefix: string): string[] {
//       return Array.from({ length: prefix.length - this.k + 1 }, (_, i) =>
//         prefix.substring(i, i + this.k)
//       );
//     }

//     private getOriginalTerm(movieId: number): string {
//       // Implement reverse lookup from movie ID to original term
//       return ""; // Replace with actual logic
//     }
//   }
export class KGramIndex {
    private index: Map<string, Set<number>> = new Map();
    private movieTitles: Map<number, string> = new Map(); // Track original titles
    private k = 3;

    addTerm(term: string, movieId: number) {
      const normalized = term.toLowerCase();
      this.movieTitles.set(movieId, normalized); // Store original title

      // Generate k-grams (n=3)
      for (let i = 0; i <= normalized.length - this.k; i++) {
        const gram = normalized.substring(i, i + this.k);
        if (!this.index.has(gram)) this.index.set(gram, new Set());
        this.index.get(gram)?.add(movieId);
      }
    }

    searchWildcard(pattern: string): number[] {
        const regexPattern = `^${pattern.toLowerCase().replace(/\*/g, ".*")}$`;
        const wildcardRegex = new RegExp(regexPattern);

        // Split pattern into prefix/suffix
        const [prefix, suffix] = pattern.toLowerCase().split('*');
        const usePrefix = prefix.length >= this.k;

        // Get candidates using k-grams only if prefix is long enough
        const candidates = new Set<number>();
        if (usePrefix) {
          const grams = this.getPrefixGrams(prefix);
          grams.forEach(gram => {
            this.index.get(gram)?.forEach(movieId => candidates.add(movieId));
          });
        } else {
          // If prefix is too short, check all movies
          this.movieTitles.forEach((_, id) => candidates.add(id));
        }

        // Verify candidates against full regex
        return Array.from(candidates).filter(id => {
          const title = this.movieTitles.get(id) || "";
          return wildcardRegex.test(title);
        });
      }
    private getPrefixGrams(prefix: string): string[] {
      const grams: string[] = [];
      for (let i = 0; i <= prefix.length - this.k; i++) {
        grams.push(prefix.substring(i, i + this.k));
      }
      return grams.length > 0 ? grams : [""];
    }
  }
