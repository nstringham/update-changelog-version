#!/usr/bin/env node

import fs from "fs";
import upath from "upath";
import versionChangelog from "./index.js";
import minimist from "minimist";

const packageJson = require(upath.join(process.cwd(), "package.json"));

const argv = minimist(process.argv.slice(2));

const validRemotes = ["bitbucket", "github", "gitlab"];

let fileName = argv._[0] ?? "CHANGELOG.md";
const remote = validRemotes.includes(argv.remote) ? argv.remote : "github";

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
