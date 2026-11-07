// @ts-check

import { execSync } from "child_process";

/**
 * Run a shell command synchronously and return the result
 * @param {string} command The shell command to run
 * @returns {string} The result of the command
 * @throws {Error} If the command fails
 */
export function runCommand(command) {
  return execSync(command, { encoding: "utf-8", windowsHide: true });
}
