import { verifyToken } from "../utils/jwt";
import { writevents, readevents } from "./utils/eventstorage";

export async function POST(request) {
    const body =  request.json();

    const { title, description, date, location, action } = body
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const decode = verifyToken(token)
    console.log("decode", decode)
    if (!decode) return Response.json({ message: "Unauthorize" }, { status: 404 })
    try {
        if (action === "post") {

            if (!title || !description || !location) {
                return Response.json({ message: "Title,  and location are required" }, { status: 401 })
            }
            const formattedDate = new Date(date).toISOString().split('T')[0];
            const newEvent = {
                id: Date.now().toString(),
                title,
                description,
                date: formattedDate,
                location,
                postedBy: decode.name,
                createdAt: new Date().toISOString()
            }
            const currentEvents = readevents();
            const updatedEvents = [...currentEvents, newEvent];
            writevents(updatedEvents);
            return Response.json({ message: "event created sucessfully", event: newEvent }, { status: 200 })
        }

        if (action === "get") {
            const events = readevents()
            return Response.json({ message: "get events", events }, { status: 200 })
        }
        return Response.json(
            { message: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error processing request:", error);
        return Response.json(
            { message: "internal server error" },
            { status: 500 }
        );
    }
}