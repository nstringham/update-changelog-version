import { runCommand } from "./run-command.js";

/**
 * Gets the URL of the git remote origin
 * @returns The URL of the git remote origin
 */
export default function gitRemote(): string {
  const remoteUrl = runCommand("git config --get remote.origin.url").trim();

  if (!remoteUrl) {
    throw new Error(
      "Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository",
    );
  }

  return remoteUrl;
}
