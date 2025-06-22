import jwt from 'jsonwebtoken';
export const SECRET = process.env.JWT_SECRET || 'dev-secret';
export const signToken = (payload) =>
    jwt.sign(payload, SECRET, { expiresIn: '1d' });

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);

    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}