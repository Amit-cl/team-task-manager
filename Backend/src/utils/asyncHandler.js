/**
 * Wraps async route handlers so that unhandled promise rejections
 * are forwarded to Express's global error handler (next(err)).
 * Without this, an unhandled rejection will crash the Node.js process.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
