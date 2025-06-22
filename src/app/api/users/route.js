import { readuser, writeuser } from './utils/userstorage';
import { signToken, verifyToken } from '../utils/jwt';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name, location, action, password } = body;
        const users = readuser();
        const existingUser = users.find(u => u.email === email);

        console.log("Action:", action, "for email:", email);

        if (action === 'signup') {
            if (existingUser) {
                return Response.json({ message: 'User already exists' }, { status: 409 });
            }

            if (!email || !password || !name || !location) {
                return Response.json({ message: 'All fields are required' }, { status: 400 });
            }

            if (!/^\S+@\S+\.\S+$/.test(email)) {
                return Response.json({ message: 'Invalid email format' }, { status: 400 });
            }

            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(password)) {
                return Response.json(
                    { message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 special character, and be at least 6 characters long.' },
                    { status: 400 }
                );
            }

            const newUser = { id: Date.now(), name, email, password, location };
            users.push(newUser);
            writeuser(users);

            const safeUser = { ...newUser };
            delete safeUser.password;
            const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name });

            return Response.json({
                message: 'User created',
                user: safeUser,
                token
            }, { status: 201 });
        }

        if (action === 'login') {
            if (!existingUser || existingUser.password !== password) {
                return Response.json({ message: 'Invalid credentials' }, { status: 401 });
            }
            const safeUser = { ...newUser };
            delete safeUser.password;
            const token = signToken({ id: existingUser.id, email: existingUser.email, name: existingUser.name });

            return Response.json({
                message: 'Login successful',
                user: safeUser,
                token
            }, { status: 200 });
        }

        if (action === 'me') {
            const authHeader = request.headers.get('authorization');
            if (!authHeader) {
                return Response.json({ message: 'Authorization header missing' }, { status: 401 });
            }

            const token = authHeader.replace('Bearer ', '').trim();
            const decoded = verifyToken(token);

            if (!decoded) {
                return Response.json({ message: 'Invalid token' }, { status: 401 });
            }

            const currentUser = users.find(u => u.email === decoded.email);
            if (!currentUser) {
                return Response.json({ message: 'User not found' }, { status: 404 });
            }

            const safeUser = { ...newUser };
            delete safeUser.password;
            return Response.json({
                user: safeUser,
                message: 'User data fetched'
            }, { status: 200 });
        }

        return Response.json({ message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in user route:', error);
        return Response.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}