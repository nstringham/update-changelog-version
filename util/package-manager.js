// @ts-check

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runCommand } from "./run-command";

const PACKAGE_MANAGERS = /** @type {const} */ (["npm", "yarn", "pnpm"]);

/** @typedef {typeof PACKAGE_MANAGERS[number]} PackageManager */

/**
 * Checks if the given string is a valid package manager
 * @param {string} packageManager
 * @returns {packageManager is PackageManager}
 */
export function isPackageManager(packageManager) {
  return /** @type {readonly string[]} */ (PACKAGE_MANAGERS).includes(packageManager);
}

/**
 * Detects which package manager is being used
 * @param {string} cwd - The directory to check for the package manager
 * @returns {PackageManager}
 */
export function detectPackageManager(cwd) {
  const packagePath = join(cwd, "package.json");
  if (existsSync(packagePath)) {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const packageManager = getPackageManagerFromPackageJson(packageJson);
    if (packageManager != null) {
      return packageManager;
    }
  }
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

/**
 * Gets the name of the package manager from package.json
 * @param {{[key: string]: unknown}} packageJson
 * @returns {PackageManager | null} The detected package manager or null if not found
 */
function getPackageManagerFromPackageJson(packageJson) {
  if ("packageManager" in packageJson && typeof packageJson.packageManager === "string") {
    const packageManager = packageJson.packageManager.split("@")[0];
    if (isPackageManager(packageManager)) {
      return packageManager;
    } else {
      console.warn(`Unknown package manager: ${packageManager}`);
    }
  }
  if (
    "devEngines" in packageJson &&
    typeof packageJson.devEngines === "object" &&
    packageJson.devEngines != null &&
    "packageManager" in packageJson.devEngines &&
    typeof packageJson.devEngines.packageManager === "object" &&
    packageJson.devEngines.packageManager != null &&
    "name" in packageJson.devEngines.packageManager &&
    typeof packageJson.devEngines.packageManager.name === "string"
  ) {
    const packageManager = packageJson.devEngines.packageManager.name;
    if (isPackageManager(packageManager)) {
      return packageManager;
    } else {
      console.warn(`Unknown package manager: ${packageManager}`);
    }
  }
  return null;
}

/** @type {{ readonly [key in PackageManager]: string }} */
const VERSION_PREFIX_COMMANDS = {
  npm: "npm config get tag-version-prefix",
  yarn: "yarn config get version-tag-prefix",
  pnpm: "pnpm config get tag-version-prefix",
};

/**
 * Gets the version prefix configured for a given package manger
 * @param {PackageManager} packageManager
 * @returns {string} The version prefix or null if not found
 */
export function getVersionPrefix(packageManager) {
  const output = runCommand(VERSION_PREFIX_COMMANDS[packageManager]).trim();
  if (output == "" || output == String(undefined)) {
    return "v";
  }
  return output;
}
