"use strict";

// @ts-check

const path = require("path");
const fs = require("fs");

/**
 * Checks if the current project uses pnpm by looking for a pnpm-lock.yaml file
 * @param {string} [cwd]
 * @returns {boolean}
 */
module.exports = (cwd) => fs.existsSync(path.resolve(cwd || process.cwd(), "pnpm-lock.yaml"));
