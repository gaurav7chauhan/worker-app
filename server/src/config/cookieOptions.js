export const cookieOptions = {
  httpOnly: true,                                  // Cookie not accessible via JavaScript (prevents XSS)
  secure: false,   // Only send cookie over HTTPS in production
  sameSite: 'lax',                                //
  maxAge: 7 * 24 * 60 * 60 * 1000,                 // Cookie expires after 7 days (in milliseconds)
  path: '/',                           // Cookie is only sent to the refresh endpoint
};

// Production me::::::::
// secure: true,
// sameSite: 'none'
