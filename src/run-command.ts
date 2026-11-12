import { execSync } from "child_process";

/**
 * Run a shell command synchronously and return the result
 * @param command The shell command to run
 * @returnsThe result of the command
 * @throws If the command fails
 */
export function runCommand(command: string): string {
  return execSync(command, { encoding: "utf-8", windowsHide: true }).trim();
}
