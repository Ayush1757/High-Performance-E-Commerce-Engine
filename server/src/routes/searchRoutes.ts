import { Router } from 'express';
import { vectorSearch, searchSuggest } from '../controllers/searchController';

const router = Router();

// Public search routes
router.get('/', vectorSearch);
router.get('/suggest', searchSuggest);

export default router;
