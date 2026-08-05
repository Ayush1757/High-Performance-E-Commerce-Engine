import logger from './logger';

/**
 * Self-contained text embedding generator for vector search.
 *
 * Uses a deterministic TF-IDF-like approach to generate fixed-dimension
 * embeddings without requiring an external API key. This enables
 * semantic search demonstration out-of-the-box.
 *
 * For production use with higher quality embeddings, configure
 * OPENAI_API_KEY in your environment to use OpenAI's embedding model.
 */

const EMBEDDING_DIMENSIONS = 256;

/** Common English stop words to filter out */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'and',
  'but', 'or', 'if', 'it', 'its', 'this', 'that', 'these', 'those',
]);

/**
 * Deterministic hash function that maps a string to a number.
 * Used to map words to embedding dimensions.
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Tokenize and normalize text into meaningful terms.
 */
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
};

/**
 * Generate a fixed-dimension embedding vector for the given text.
 *
 * Algorithm:
 * 1. Tokenize the text into meaningful terms
 * 2. For each term, hash it to a dimension index
 * 3. Accumulate weighted values (TF-IDF-like)
 * 4. Normalize the vector to unit length
 *
 * @param text - The text to generate an embedding for
 * @returns A number array of EMBEDDING_DIMENSIONS length
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // If OpenAI is configured, use it for higher quality
  if (process.env.OPENAI_API_KEY) {
    return generateOpenAIEmbedding(text);
  }

  // Fallback: self-contained deterministic embedding
  return generateLocalEmbedding(text);
};

/**
 * Generate embedding using local TF-IDF-like approach.
 */
const generateLocalEmbedding = (text: string): number[] => {
  const tokens = tokenize(text);
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);

  if (tokens.length === 0) {
    return vector;
  }

  // Count term frequencies
  const termFreq = new Map<string, number>();
  tokens.forEach((token) => {
    termFreq.set(token, (termFreq.get(token) || 0) + 1);
  });

  // Generate embedding using hashing trick
  termFreq.forEach((freq, term) => {
    const hash = hashCode(term);

    // Map to multiple dimensions for better distribution
    for (let j = 0; j < 3; j++) {
      const idx = (hash + j * 97) % EMBEDDING_DIMENSIONS;
      const sign = (hash >> j) & 1 ? 1 : -1;
      const weight = Math.log(1 + freq) * sign;
      vector[idx] += weight;
    }

    // Character n-gram features for similar word matching
    for (let n = 2; n <= Math.min(4, term.length); n++) {
      for (let i = 0; i <= term.length - n; i++) {
        const ngram = term.substring(i, i + n);
        const ngramIdx = hashCode(ngram) % EMBEDDING_DIMENSIONS;
        vector[ngramIdx] += 0.3;
      }
    }
  });

  // L2 normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = Number((vector[i] / magnitude).toFixed(6));
    }
  }

  return vector;
};

/**
 * Generate embedding using OpenAI's embedding API.
 * Only used when OPENAI_API_KEY is configured.
 */
const generateOpenAIEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000), // Limit to avoid token limits
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    return data.data[0].embedding;
  } catch (error) {
    logger.warn('OpenAI embedding failed, falling back to local', { error: (error as Error).message });
    return generateLocalEmbedding(text);
  }
};

/**
 * Generate a combined embedding from product fields.
 * Gives more weight to the product name.
 */
export const generateProductEmbedding = async (
  name: string,
  description: string,
  category: string,
  brand: string
): Promise<number[]> => {
  // Combine fields with name given more weight
  const combinedText = `${name} ${name} ${category} ${brand} ${description}`;
  return generateEmbedding(combinedText);
};

/** Embedding dimensions constant exposed for index creation */
export const VECTOR_DIMENSIONS = EMBEDDING_DIMENSIONS;
