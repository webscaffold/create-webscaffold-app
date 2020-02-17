import express from 'express';
const router = express.Router();
import { getPostsRouter } from './api/posts';
import { homePageRouter } from './home';
import { aboutPageRouter } from './about';

// API routes
router.get('/api/v1/posts/:year?/:month?/:day?', getPostsRouter.getPosts);

// Pages routes
router.get('/', homePageRouter);
router.get('/about', aboutPageRouter);

export default router;
