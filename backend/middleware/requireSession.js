// Middleware: require an active session to access protected routes
export function requireSession(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Please log in to continue.' });
}
