import { isGitUrl, type GitUrl } from "./remote.js";
import { runCommand } from "./run-command.js";

/**
 * Gets the URL of the git remote origin
 * @returns The URL of the git remote origin
 */
export default function gitRemote(): GitUrl {
  const remoteUrl = runCommand("git config --get remote.origin.url").trim();

  if (!remoteUrl) {
    throw new Error(
      "Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository",
    );
  }

  if (!isGitUrl(remoteUrl)) {
    throw new Error(`Invalid git URL: ${remoteUrl}`);
  }

  return remoteUrl;
}
