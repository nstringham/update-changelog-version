#!/usr/bin/env node

// @ts-check

import githubUrlFromGit from "github-url-from-git";
import bitbucketUrlFromGit from "bitbucket-url-from-git";
import { parse as gitlabUrlFromGit } from "giturl";
import gitRemote from "./util/git-remote";
import { runCommand } from "./util/run-command.js";
import { detectPackageManager } from "./util/detect-package-manager.js";
import { formatDate } from "./util/format-date.js";

/**
 * Replaces the "Unreleased" heading with a new version heading including the date.
 * @argument {string} data The changelog markdown
 * @argument {string} versionString The new version
 * @returns {string} The updated changelog markdown
 */
function insertHeading(data, versionString) {
  return data.replace(/(## \[Unreleased\].*)/g, "$1\n\n## [" + versionString + "][] - " + formatDate(new Date()));
}

/**
 * gets the version tag prefix from the package manager configuration
 * @returns {string} The version tag prefix (defaults to "v")
 */
function getVersionPrefix() {
  const packageManager = detectPackageManager(process.cwd());
  var versionPrefix = "";
  if (packageManager === "pnpm") {
    versionPrefix = runCommand("pnpm config get tag-version-prefix").trim();
  } else if (packageManager === "yarn") {
    versionPrefix = runCommand("yarn config get version-tag-prefix").trim();
  } else {
    versionPrefix = runCommand("npm config get tag-version-prefix").trim();
  }
  if (versionPrefix === String(undefined)) {
    versionPrefix = "";
  }
  return versionPrefix || "v";
}

/** @typedef {{unreleased: string, previous: string}} UriResult */

/**
 * Gets the GitHub URLs for the unreleased and previous versions.
 * @param {string} data The changelog markdown
 * @param {string} newVersion The new version
 * @returns {UriResult} The GitHub URLs for the unreleased and previous versions
 */
function githubUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/compare\/(.*)\.\.\.HEAD/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    remoteUrl = githubUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/compare/" + previousVersion + "..." + prefix + newVersion;
  } else {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/tree/" + prefix + newVersion;
  }

  return {
    unreleased: "[Unreleased]: " + remoteUrl + "/compare/" + prefix + newVersion + "...HEAD",
    previous: previousLink,
  };
}

/**
 * Gets the Bitbucket URLs for the unreleased and previous versions.
 * @param {string} data The changelog markdown
 * @param {string} newVersion The new version
 * @returns {UriResult} The Bitbucket URLs for the unreleased and previous versions
 */
function bitbucketUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/branches\/compare\/master%0D(.*)/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    remoteUrl = bitbucketUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink =
      "[" + newVersion + "]: " + remoteUrl + "/branches/compare/" + prefix + newVersion + "%0D" + previousVersion;
  } else {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/commits/tag/" + prefix + newVersion;
  }

  return {
    unreleased: "[Unreleased]: " + remoteUrl + "/branches/compare/master%0D" + prefix + newVersion,
    previous: previousLink,
  };
}

/**
 * Gets the GitLab URLs for the unreleased and previous versions.
 * @param {string} data The changelog markdown
 * @param {string} newVersion The new version
 * @returns {UriResult} The GitLab URLs for the unreleased and previous versions
 */
function gitlabUris(data, newVersion) {
  var remoteUrl;
  var previousVersion;
  var previousLink;
  var prefix = getVersionPrefix();

  // Try get previous version and remote from unreleased tag if it exists
  var match = /\[Unreleased\]: (.*)\/compare\/master...(.*)/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    var remote = gitRemote();
    remoteUrl = gitlabUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/compare/" + prefix + newVersion + "..." + previousVersion;
  } else {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/tags/" + prefix + newVersion;
  }

  return {
    unreleased: "[Unreleased]: " + remoteUrl + "/compare/master..." + prefix + newVersion,
    previous: previousLink,
  };
}

/** @typedef {"github" | "gitlab" | "bitbucket"} Remote */

const UriFunctions = {
  github: githubUris,
  gitlab: gitlabUris,
  bitbucket: bitbucketUris,
};

/**
 * Updates the urls of the changelog for the given version and remote repository
 * @param {string} data The changelog markdown
 * @param {string} versionString The new version
 * @param {Remote} remote The remote repository type
 * @returns {string} The updated changelog markdown
 */
function updateCompareUri(data, versionString, remote) {
  var remoteUrl;
  var uris = UriFunctions[remote](data, versionString);

  if (data.match(/\[Unreleased\]:/)) {
    return data.replace(/\[Unreleased\]:.*/, uris.unreleased + "\n" + uris.previous);
  }

  return data + "\n\n" + uris.unreleased + "\n" + uris.previous;
}

/**
 * Update the changelog with the new version and remote repository URLs
 * @param {string} data the changelog markdown
 * @param {{version: string, remote?: Remote}} version The version and remote repository type
 * @param {(error: Error|null, data?: string) => void} done The callback function
 */
export default function versionChangelog(data, { version, remote }, done) {
  try {
    // Add the heading for the new version number
    data = insertHeading(data, version);

    // Update the [Unreleased] URI
    // and add the new version URI
    data = updateCompareUri(data, version, remote ? remote : "github");
  } catch (error) {
    done(/** @type {Error} */ (error));
  }
  done(null, data);
}
