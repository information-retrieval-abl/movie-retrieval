export class PositionalIndex {
    private index: Record<string, Record<number, number[]>> = {};

    addDocument(docId: number, text: string) {
      const tokens = this.tokenize(text);
      tokens.forEach((token, position) => {
        this.index[token] = this.index[token] || {};
        this.index[token][docId] = this.index[token][docId] || [];
        this.index[token][docId].push(position);
      });
    }

    searchPhrase(phrase: string): number[] {
      const tokens = this.tokenize(phrase);
      if (tokens.length === 0) return [];

      const results = new Set<number>();

      const firstTokenDocs = this.index[tokens[0]] || {};
      Object.keys(firstTokenDocs).forEach(docId => {
        const numericDocId = Number(docId);
        const positions = tokens.map(token => this.index[token]?.[numericDocId] || []);

        if (positions.every(p => p.length > 0)) {
          positions[0].forEach(pos => {
            if (positions.every((p, i) => p.includes(pos + i))) {
              results.add(numericDocId);
            }
          });
        }
      });

      return Array.from(results);
    }

    private tokenize(text: string): string[] {
      return text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
    }
  }
