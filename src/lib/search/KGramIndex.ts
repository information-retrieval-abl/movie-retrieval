export class KGramIndex {
    private index: Map<string, Set<number>> = new Map();
    private k = 3;

    addTerm(term: string, movieId: number) {
      const normalized = term.toLowerCase();
      for (let i = 0; i <= normalized.length - this.k; i++) {
        const gram = normalized.substring(i, i + this.k);
        if (!this.index.has(gram)) this.index.set(gram, new Set());
        this.index.get(gram)?.add(movieId);
      }
    }

    searchWildcard(pattern: string): number[] {
      const wildcardRegex = new RegExp(`^${pattern.toLowerCase().replace(/\*/g, ".*")}$`);
      const prefix = pattern.split('*')[0];
      const grams = this.getPrefixGrams(prefix);

      const candidates = new Set<number>();
      grams.forEach(gram => {
        this.index.get(gram)?.forEach(movieId => candidates.add(movieId));
      });

      return Array.from(candidates);
    }

    private getPrefixGrams(prefix: string): string[] {
      return Array.from({ length: prefix.length - this.k + 1 }, (_, i) =>
        prefix.substring(i, i + this.k)
      );
    }
  }
