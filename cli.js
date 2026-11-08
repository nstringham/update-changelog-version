#!/usr/bin/env node

// @ts-check

import fs from "fs";
import upath from "upath";
import versionChangelog from "./index.js";
import minimist from "minimist";

const packageJson = require(upath.join(process.cwd(), "package.json"));

var argv = minimist(process.argv.slice(2));

var validRemotes = ["bitbucket", "github", "gitlab"];

var fileName = argv._[0] || "CHANGELOG.md";
var remote = validRemotes.indexOf(argv.remote) !== -1 ? argv.remote : "github";

if (!upath.isAbsolute(fileName)) {
  fileName = upath.normalize(upath.join(process.cwd(), fileName));
}

// Grab the current version of the package.
// When run as part of the `"version"` script
// (for example by `npm release`)
// it will be the _new_ version
var version = packageJson.version;

var data = fs.readFileSync(fileName, "utf8");

versionChangelog(data, { version: version, remote: remote })
  .catch((error) => {
    console.error(error.message || error.toString());
    process.exit(1);
  })
  .then((data) => {
    fs.writeFileSync(fileName, data, "utf8");
    process.exit(0);
  });
