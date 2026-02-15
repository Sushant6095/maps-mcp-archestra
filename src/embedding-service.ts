// eslint-disable-next-line @typescript-eslint/no-require-imports
import OpenAI from 'openai';

export class EmbeddingService {
  private openai: OpenAI | null = null;
  private vectorSize: number = 1536; // OpenAI text-embedding-3-small default

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // Generate embedding for a place (combines name, address, tags, notes, category)
  async generatePlaceEmbedding(place: {
    name: string;
    address: string;
    category?: string;
    tags?: string[];
    notes?: string;
  }): Promise<number[]> {
    const text = this.buildPlaceText(place);

    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        console.error('OpenAI embedding failed:', error);
        // Fallback to simple hash-based embedding
        return this.fallbackEmbedding(text);
      }
    } else {
      // Fallback to simple hash-based embedding if no API key
      return this.fallbackEmbedding(text);
    }
  }

  // Generate embedding for a search query
  async generateQueryEmbedding(query: string): Promise<number[]> {
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query,
        });
        return response.data[0].embedding;
      } catch (error) {
        console.error('OpenAI embedding failed:', error);
        return this.fallbackEmbedding(query);
      }
    } else {
      return this.fallbackEmbedding(query);
    }
  }

  // Build text representation of a place for embedding
  private buildPlaceText(place: {
    name: string;
    address: string;
    category?: string;
    tags?: string[];
    notes?: string;
  }): string {
    const parts: string[] = [place.name];

    if (place.category) {
      parts.push(place.category);
    }

    if (place.address) {
      parts.push(place.address);
    }

    if (place.tags && place.tags.length > 0) {
      parts.push(...place.tags);
    }

    if (place.notes) {
      parts.push(place.notes);
    }

    return parts.join(' ');
  }

  // Fallback embedding using simple hash-based approach
  // This creates a deterministic vector based on text content
  private fallbackEmbedding(text: string): number[] {
    const vector: number[] = new Array(this.vectorSize).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash + word.charCodeAt(j)) & 0xffffffff;
      }

      // Distribute hash across vector dimensions
      for (let dim = 0; dim < this.vectorSize; dim++) {
        const seed = hash + dim;
        const value = Math.sin(seed) * 0.5 + 0.5; // Normalize to [0, 1]
        vector[dim] += value / words.length;
      }
    }

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map((val) => val / magnitude);
    }

    return vector;
  }

  getVectorSize(): number {
    return this.vectorSize;
  }
}
