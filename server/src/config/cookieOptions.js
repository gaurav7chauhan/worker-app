export const cookieOptions = {
  httpOnly: true,                                  // Cookie not accessible via JavaScript (prevents XSS)
  secure: process.env.NODE_ENV === 'production',   // Only send cookie over HTTPS in production
  sameSite: 'none',                                //
  maxAge: 7 * 24 * 60 * 60 * 1000,                 // Cookie expires after 7 days (in milliseconds)
  path: '/  ',                           // Cookie is only sent to the refresh endpoint
};
