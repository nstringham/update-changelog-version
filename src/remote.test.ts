import { describe, it, expect } from "vitest";
import { GitHub } from "./remote.js";

describe("GitHub", () => {
  describe("fromGitUrl", () => {
    it("should support git://*", () => {
      const gitUrl = "git://github.com/jamesor/mongoose-versioner";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/jamesor/mongoose-versioner");
    });

    it("should support git://*.git", () => {
      const gitUrl = "git://github.com/treygriffith/cellar.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/treygriffith/cellar");
    });

    it("should support https://*", () => {
      const gitUrl = "https://github.com/Empeeric/i18n-node";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/Empeeric/i18n-node");
    });

    it("should support https://*.git", () => {
      const gitUrl = "https://jpillora@github.com/banchee/tranquil.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/banchee/tranquil");
    });

    it("should throw error on failure", () => {
      const gitUrl = "git://github.com/justgord/.git";
      expect(() => GitHub.fromGitUrl(gitUrl)).toThrow("Invalid GitHub URL");
    });

    it("should parse git@github.com:bcoe/thumbd.git", () => {
      const gitUrl = "git@github.com:bcoe/thumbd.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git@github.com:/bcoe/thumbd.git", () => {
      const gitUrl = "git@github.com:/bcoe/thumbd.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git@github.com:bcoe/thumbd.git#2.7.0", () => {
      const gitUrl = "git@github.com:bcoe/thumbd.git#2.7.0";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git+https://github.com/bcoe/thumbd.git", () => {
      const gitUrl = "git+https://github.com/bcoe/thumbd.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git+ssh://github.com/bcoe/thumbd.git", () => {
      const gitUrl = "git+ssh://github.com/bcoe/thumbd.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse https://EastCloud@github.com/EastCloud/node-websockets.git", () => {
      const gitUrl = "https://EastCloud@github.com/EastCloud/node-websockets.git";
      expect(GitHub.fromGitUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/EastCloud/node-websockets");
    });
  });

  describe("getChangesUrl", () => {
    it("should return a tree url when the base is null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl(null, "v1.0.0")).toBe(
        "https://github.com/nstringham/update-changelog-version/tree/v1.0.0",
      );
    });

    it("should compare to HEAD when compare is null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl("v1.0.0", null)).toBe(
        "https://github.com/nstringham/update-changelog-version/compare/v1.0.0...HEAD",
      );
    });

    it("should compare compare to base when both base and compare are not null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl("v1.0.0", "v1.0.1")).toBe(
        "https://github.com/nstringham/update-changelog-version/compare/v1.0.0...v1.0.1",
      );
    });
  });
});
