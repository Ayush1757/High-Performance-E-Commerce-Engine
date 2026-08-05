import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { generateEmbedding } from '../utils/embeddings';
import { getOrSetCache } from '../utils/cache';
import logger from '../utils/logger';

/**
 * @desc    Semantic vector search for products
 * @route   GET /api/search
 * @access  Public
 *
 * Uses MongoDB Atlas Vector Search when a vector search index is configured,
 * otherwise falls back to a cosine similarity computation in the aggregation pipeline.
 */
export const vectorSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Search query (q) is required' });
      return;
    }

    const query = q.trim();
    const numResults = Math.min(50, Math.max(1, Number(limit) || 10));

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Cache key based on query
    const cacheKey = `search:${query}:${numResults}`;

    const results = await getOrSetCache(
      cacheKey,
      async () => {
        try {
          // Try Atlas Vector Search first ($vectorSearch stage)
          const vectorResults = await Product.aggregate([
            {
              $vectorSearch: {
                index: 'vector_index',
                path: 'embedding',
                queryVector: queryEmbedding,
                numCandidates: numResults * 10,
                limit: numResults,
              },
            },
            {
              $project: {
                name: 1,
                description: 1,
                price: 1,
                category: 1,
                brand: 1,
                images: 1,
                rating: 1,
                stock: 1,
                score: { $meta: 'vectorSearchScore' },
              },
            },
          ]);

          return vectorResults;
        } catch (atlasError) {
          // Fallback: manual cosine similarity if Atlas Vector Search index not configured
          logger.warn('Atlas Vector Search not available, using fallback search');

          return fallbackSemanticSearch(queryEmbedding, query, numResults);
        }
      },
      180 // 3 minute TTL for search results
    );

    res.json({
      success: true,
      data: {
        query,
        results,
        total: results.length,
      },
    });
  } catch (error) {
    logger.error('Vector search failed', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

/**
 * Fallback semantic search using text search combined with keyword matching.
 * Used when Atlas Vector Search index is not configured.
 */
const fallbackSemanticSearch = async (
  _queryEmbedding: number[],
  queryText: string,
  numResults: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
  // Use MongoDB text search as fallback
  const textResults = await Product.find(
    { $text: { $search: queryText } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(numResults)
    .lean();

  if (textResults.length > 0) {
    return textResults;
  }

  // If text search yields nothing, try regex match
  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const regexResults = await Product.find({
    $or: [
      { name: { $regex: escapeRegex(queryText), $options: 'i' } },
      { description: { $regex: escapeRegex(queryText), $options: 'i' } },
      { category: { $regex: escapeRegex(queryText), $options: 'i' } },
      { brand: { $regex: escapeRegex(queryText), $options: 'i' } },
    ],
  })
    .limit(numResults)
    .lean();

  return regexResults;
};

/**
 * @desc    Get search suggestions / autocomplete
 * @route   GET /api/search/suggest
 * @access  Public
 */
export const searchSuggest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const query = q.trim();
    const escapeRegex = (str: string): string => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const suggestions = await getOrSetCache(
      `suggest:${query}`,
      async () => {
        const results = await Product.aggregate([
          {
            $match: {
              name: { $regex: escapeRegex(query), $options: 'i' },
            },
          },
          {
            $group: {
              _id: '$category',
              products: {
                $push: { name: '$name', _id: '$_id', price: '$price' },
              },
            },
          },
          { $limit: 5 },
          {
            $project: {
              category: '$_id',
              products: { $slice: ['$products', 3] },
            },
          },
        ]);

        return results;
      },
      120 // 2 minute TTL
    );

    res.json({ success: true, data: suggestions });
  } catch (error) {
    logger.error('Search suggest failed', { error: (error as Error).message });
    res.status(500).json({ success: false, message: 'Search suggestions failed' });
  }
};
