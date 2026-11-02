// @ts-check

import path from "path";
import fs from "fs";

/**
 * Checks if the current project uses pnpm by looking for a pnpm-lock.yaml file
 * @param {string} [cwd]
 * @returns {boolean}
 */
export default function hasPnpm(cwd) {
  return fs.existsSync(path.resolve(cwd || process.cwd(), "pnpm-lock.yaml"));
}
