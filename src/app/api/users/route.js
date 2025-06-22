import { readuser, writeuser } from './utils/userstorage';
import { signToken, verifyToken } from '../utils/jwt';
export async function POST(request) {
    const body = await request.json();
    const { email,  name, location, action  } = body;
    const users = readuser();
    const existingUser = users.find(u => u.email === email);
    console.log("email", email)
    if (action === 'signup') {
        if (existingUser) {
            return Response.json({ message: 'User already exists' }, { status: 409 });
        }
        if (!email || !password || !name || !location) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            console.log('Invalid email:', email);
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
        const { password,...safe } = newUser;
        const token = signToken({ id: safe.id, email: safe.email, name: safe.name || name });
        return Response.json({ message: 'User created', user: safe, token }, { status: 201 });
    }
    if (action === 'login') {
        if (!existingUser || existingUser.password !== password || existingUser.email != email) {
            return Response.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        const { password, ...safe } = existingUser;
        const token = signToken({ id: safe.id, email: safe.email, name: safe.name });
        return Response.json({ message: 'Login successful', user: safe, token }, { status: 200 });
    }
    if (action === 'me') {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '').trim();

        const decoded = verifyToken(token);
        if (!decoded) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = users.find(u => u.email === decoded.email);
        if (!currentUser) {
            return Response.json({ message: 'User not found' }, { status: 404 });
        }

      
        return Response.json({ user: safe, message: 'User data fetched' }, { status: 200 });
    }
    return Response.json({ message: 'Invalid action' }, { status: 400 });
}
