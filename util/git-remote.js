var spawn = require("cross-spawn");

// @ts-check

/**
 * Gets the URL of the git remote origin
 * @returns {string} The URL of the git remote origin
 */
function gitRemote() {
  var remoteUrl = spawn.sync("git", ["config", "--get", "remote.origin.url"]).stdout.toString().trim();

  if (!remoteUrl) {
    throw new Error(
      "Unable to determine origin URL for adding to changelog - ensure you have initialized a git repository",
    );
  }

  return remoteUrl;
}

module.exports = gitRemote;
