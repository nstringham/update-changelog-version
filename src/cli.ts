#!/usr/bin/env node

import fs from "fs";
import upath from "upath";
import versionChangelog from "./index.js";
import { parseArgs } from "node:util";

const packageJson = require(upath.join(process.cwd(), "package.json"));

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: { remote: { type: "string" } },
});

const validRemotes = ["bitbucket", "github", "gitlab"] as const;

function isValidRemote(remote: unknown): remote is (typeof validRemotes)[number] {
  return typeof remote === "string" && (validRemotes as readonly string[]).includes(remote);
}

let fileName = positionals[0] ?? "CHANGELOG.md";
const remote = isValidRemote(values.remote) ? values.remote : "github";

if (!upath.isAbsolute(fileName)) {
  fileName = upath.normalize(upath.join(process.cwd(), fileName));
}

// Grab the current version of the package.
// When run as part of the `"version"` script
// (for example by `npm release`)
// it will be the _new_ version
const version = packageJson.version;

const changelog = fs.readFileSync(fileName, "utf8");

const updatedChangelog = await versionChangelog(changelog, { version: version, remote: remote });

fs.writeFileSync(fileName, updatedChangelog, "utf8");
