import { join } from 'node:path';

/** Folder where images are stored and served from at /uploads. */
export const UPLOADS_DIR = join(process.cwd(), 'uploads');
