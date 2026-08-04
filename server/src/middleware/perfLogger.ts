import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

/**
 * Middleware that logs request execution time and optionally Redis/DB times.
 * It records the total time from request start to response finish.
 */
export const perfLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = performance.now();
  // Attach placeholders for downstream code to add more detailed timings if needed
  (res as any).locals = (res as any).locals || {};
  (res as any).locals.redisTime = 0;
  (res as any).locals.dbTime = 0;

  // When response is finished, output the metrics
  res.on('finish', () => {
    const total = performance.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const redisMs = (res as any).locals.redisTime?.toFixed(2) ?? '0.00';
    const dbMs = (res as any).locals.dbTime?.toFixed(2) ?? '0.00';
    console.log(`[PERF] ${method} ${url} - Total: ${total.toFixed(2)} ms, Redis: ${redisMs} ms, DB: ${dbMs} ms`);
  });

  next();
};
