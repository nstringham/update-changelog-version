// @ts-check

import { beforeEach, describe, it, vi } from "vitest";

import assert from "assert";
import { formatDate } from "../util/format-date";
import gitRemote from "../util/git-remote";

vi.mock(import("../util/git-remote"), () => ({ default: vi.fn() }));

import versionChangelog from "../index";

const todayDate = formatDate(new Date());
const repoBase = "https://github.com/nstringham/";

const versionPrefix = "v";

describe("Versioning Changelog", function () {
  beforeEach(() => {
    vi.mocked(gitRemote).mockClear();
    vi.mocked(gitRemote).mockReturnValue("git@github.com:nstringham/update-changelog-version.git");
  });

  it.skip("Handles a non-git repo correctly", function () {
    // TODO: Test when the `.git` folder doesn't exist
  });

  it("Correctly adds a new version", function () {
    return new Promise((resolve, reject) => {
      versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo
        `.trim(),
        {
          version: "1.0.0",
        },
        function (error, data) {
          assert.ifError(error);
          assert.equal(
            data,
            `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
          `.trim(),
          );

          resolve();
        },
      );
    });
  });

  it("Correctly updates old unreleased sections", function () {
    return new Promise((resolve, reject) => {
      versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0

        `.trim(),
        {
          version: "2.0.0",
        },
        function (error, data) {
          assert.ifError(error);
          assert.equal(
            data,
            `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...${versionPrefix}2.0.0
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
          `.trim(),
          );

          resolve();
        },
      );
    });
  });

  describe("gitlab", function () {
    it("Correctly adds a new gitlab version", function () {
      return new Promise((resolve, reject) => {
        vi.mocked(gitRemote).mockReturnValue("git@gitlab.com:nstringham/update-changelog-version.git");
        versionChangelog(
          `
# Changelog

## [Unreleased][]
- Foo
          `.trim(),
          {
            version: "1.0.0",
            remote: "gitlab",
          },
          function (error, data) {
            assert.ifError(error);
            assert.equal(
              data,
              `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0
            `.trim(),
            );

            resolve();
          },
        );
      });
    });

    it("Correctly updates old unreleased sections with gitlab urls", function () {
      return new Promise((resolve, reject) => {
        versionChangelog(
          `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0

          `.trim(),
          {
            version: "2.0.0",
            remote: "gitlab",
          },
          function (error, data) {
            assert.ifError(error);
            assert.equal(
              data,
              `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}2.0.0
[2.0.0]: http://gitlab.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0
            `.trim(),
            );

            resolve();
          },
        );
      });
    });
  });

  describe("bitbucket", function () {
    it("Correctly adds a new bitbucket version", function () {
      return new Promise((resolve, reject) => {
        vi.mocked(gitRemote).mockReturnValue("git@bitbucket.org:nstringham/update-changelog-version.git");
        versionChangelog(
          `
# Changelog

## [Unreleased][]
- Foo
          `.trim(),
          {
            version: "1.0.0",
            remote: "bitbucket",
          },
          function (error, data) {
            assert.ifError(error);
            assert.equal(
              data,
              `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0
            `.trim(),
            );

            resolve();
          },
        );
      });
    });

    it("Correctly updates old unreleased sections with bitbucket urls", function () {
      return new Promise((resolve, reject) => {
        versionChangelog(
          `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0

          `.trim(),
          {
            version: "2.0.0",
            remote: "bitbucket",
          },
          function (error, data) {
            assert.ifError(error);
            assert.equal(
              data,
              `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}2.0.0
[2.0.0]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/${versionPrefix}2.0.0%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0
            `.trim(),
            );

            resolve();
          },
        );
      });
    });
  });

  it("Correctly handles empty Unreleased section", function () {
    return new Promise((resolve, reject) => {
      versionChangelog(
        `
# Changelog

## [Unreleased][]
        `.trim(),
        {
          version: "1.0.0",
        },
        function (error, data) {
          assert.ifError(error);
          assert.equal(
            data,
            `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
          `.trim(),
          );

          resolve();
        },
      );
    });
  });

  it("Correctly skips old versions for links", function () {
    return new Promise((resolve, reject) => {
      versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar
        `.trim(),
        {
          version: "2.0.0",
        },
        function (error, data) {
          assert.ifError(error);
          assert.equal(
            data,
            `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}2.0.0
          `.trim(),
          );

          resolve();
        },
      );
    });
  });
});
