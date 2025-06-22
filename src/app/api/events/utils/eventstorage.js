import fs from 'fs';
import path from 'path';

const filepath = path.join(process.cwd(), 'src/app/storage/events.json');

const ensureFile = () => {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '[]');
};

export const readevents = () => {
    ensureFile();
    const raw = fs.readFileSync(filepath, 'utf-8') || '[]';
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
};

export const writevents = (eventsary) => {
    ensureFile();
    fs.writeFileSync(filepath, JSON.stringify(eventsary, null, 2));
};
