import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.cookie('token', token, {
    httpOnly: true, // Prevent XSS
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', // Prevent CSRF
    maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });

  return token;
};
