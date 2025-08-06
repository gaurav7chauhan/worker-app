export const cookieOptions = {
  httpOnly: true,                                  // Cookie not accessible via JavaScript (prevents XSS)
  secure: process.env.NODE_ENV === 'production',   // Only send cookie over HTTPS in production
  sameSite: 'Strict',                              // Only send this cookie for requests from the same site (mitigates CSRF)
  maxAge: 7 * 24 * 60 * 60 * 1000,                 // Cookie expires after 7 days (in milliseconds)
  path: '/auth/refresh',                           // Cookie is only sent to the refresh endpoint for security
};
