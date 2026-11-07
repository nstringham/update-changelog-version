// @ts-check

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGE_MANAGERS = /** @type {const} */ (["npm", "yarn", "pnpm"]);

/** @typedef {typeof PACKAGE_MANAGERS[number]} PackageManager */

/**
 * Detects which package manager is being used
 * @param {string} cwd - The directory to check for the package manager
 * @returns {PackageManager}
 */
export function detectPackageManager(cwd) {
  const packagePath = join(cwd, "package.json");
  if (existsSync(packagePath)) {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    if ("packageManager" in packageJson) {
      const packageManager = packageJson.packageManager.split("@")[0];
      if (PACKAGE_MANAGERS.includes(packageManager)) {
        return packageManager;
      }
    }
    if (
      "devEngines" in packageJson &&
      typeof packageJson.devEngines === "object" &&
      "packageManager" in packageJson.devEngines &&
      typeof packageJson.devEngines.packageManager === "object" &&
      "name" in packageJson.devEngines.packageManager &&
      PACKAGE_MANAGERS.includes(packageJson.devEngines.packageManager.name)
    ) {
      return packageJson.devEngines.packageManager.name;
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
