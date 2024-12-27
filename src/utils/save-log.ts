import { writeFileSync } from 'fs';
import path from 'path';
import { ROOT_DIR } from './root-dir';
const localLogPath = path.join(ROOT_DIR, "logs", "dev-logs");
export function saveLogInFile(fileName: string, data: string) {
    const isDevENV = process?.env?.NODE_ENV === "DEVELOPMENT";
    if (!isDevENV) return;
    fileName = fileName.replace(/(\.[\w\d_-]+)$/i, '.log$1');
    try {
        writeFileSync(path.join(localLogPath, `${Date.now()}-${fileName}`), typeof data !== "string" ? JSON.stringify(data, null, 2) : data, "utf-8");
    } catch (error) {
    }
}
