import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE) || 7;

  res.cookie('token', token);

  return token;
};
