import jwt from 'jsonwebtoken';

function getUserIdFromToken(token: string): string | null {
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'my-super-secret') as { userId: string };

        const userId = decodedToken.userId;

        return userId;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}

export { getUserIdFromToken };
