import { runCommand } from "./run-command.js";

export type GitUrl =
  | `https://${string}/${string}`
  | `git+https://${string}/${string}`
  | `git@${string}:${string}`
  | `git+ssh://${string}/${string}`
  | `ssh://git@${string}/${string}`
  | `git://${string}/${string}`;

export function isGitUrl(url: string): url is GitUrl {
  return /^(https:\/\/|git\+https:\/\/|git@|git\+ssh:\/\/|ssh:\/\/git@|git:\/\/)/.test(url);
}

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
