import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE) || 7;

  res.cookie('token', token, {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', // Prevent CSRF
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
  });

  return token;
};
