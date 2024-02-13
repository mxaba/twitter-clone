import jwt from 'jsonwebtoken';

export function getUserIdFromToken(token: string): string | null {
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'my-super-secret') as { userId: string };

        const userId = decodedToken.userId;

        return userId;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}

export function arrayToString(arr: Array<string>) {
    return arr.join(',');
}

export function stringToArray(str: string) {
    return str.split(',');
}

export function extractTaggedUsers(text: string): string[] {
    const regex = /@(\w+)/g;

    const taggedUsers: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        taggedUsers.push(match[1]); 
    }

    return taggedUsers;
}
