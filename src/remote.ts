// @ts-expect-error - Dependency lacks accurate type definitions
import githubUrlFromGit from "github-url-from-git";

export type GitUrl =
  | `https://${string}/${string}`
  | `git+https://${string}/${string}`
  | `git@${string}:${string}`
  | `git+ssh://${string}/${string}`
  | `ssh://git@${string}/${string}`
  | `git://${string}/${string}`;

export function isGitUrl(url: string): url is GitUrl {
  return /^(https:\/\/|git\+https:\/\/|git@|git\+ssh:\/\/|git:\/\/)/.test(url);
}

export type BrowserUrl = `https://${string}`;

export function isBrowserUrl(url: string): url is BrowserUrl {
  return url.startsWith("https://");
}

export interface Remote {
  /**
   * Gets the URL of a website to view the repository
   */
  getRepositoryUrl(): BrowserUrl;

  /**
   * Gets the url of a webpage comparing two git versions
   * @param base the tag at the start of the changes to display or null to display all changes before the compare
   * @param compare the tag at the end of the changes to display or null to display all changes after the base
   */
  getChangesUrl(base: string | null, compare: string | null): BrowserUrl;
}

export class GitHub implements Remote {
  readonly owner: string;
  readonly repo: string;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  static fromGitUrl(url: GitUrl): GitHub {
    const gitHubUrl: BrowserUrl | undefined = githubUrlFromGit(url);
    if (gitHubUrl == null) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }
    return GitHub.fromBrowserUrl(gitHubUrl);
  }

  static fromBrowserUrl(url: BrowserUrl): GitHub {
    const match = url?.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/);
    if (match == null) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }
    return new GitHub(match[1], match[2]);
  }

  getRepositoryUrl(): BrowserUrl {
    return `https://github.com/${this.owner}/${this.repo}`;
  }

  getChangesUrl(base: string | null, compare: string | null): BrowserUrl {
    compare ??= "HEAD";

    if (base === null) {
      return `https://github.com/${this.owner}/${this.repo}/tree/${compare}`;
    }

    return `https://github.com/${this.owner}/${this.repo}/compare/${base}...${compare}`;
  }
}
