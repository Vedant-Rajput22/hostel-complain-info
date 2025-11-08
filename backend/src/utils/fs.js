import fs from 'fs';
import path from 'path';

export function ensureUploadDir() {
  const dir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
