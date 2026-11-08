// @ts-check

import { describe, it, beforeEach, expect, vi } from "vitest";
import { detectPackageManager, getVersionPrefix } from "../util/package-manager.js";
import { readFileSync, existsSync } from "node:fs";
import { runCommand } from "../util/run-command.js";

vi.mock(import("node:fs"), () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock(import("node:path"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    join: originalModule.posix.join,
  };
});

vi.mock(import("../util/run-command.js"), () => ({
  runCommand: vi.fn(),
}));

describe("detectPackageManager", () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
    vi.mocked(readFileSync).mockReset();
  });

  it("defaults to npm", () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(detectPackageManager("cwd")).toBe("npm");
  });

  it("uses packageManager from package file", () => {
    vi.mocked(existsSync).mockImplementation((path) => path == "cwd/package.json");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ packageManager: "yarn@1.22.0" }));

    expect(detectPackageManager("cwd")).toBe("yarn");

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ packageManager: "pnpm@11.25.0" }));

    expect(detectPackageManager("cwd")).toBe("pnpm");

    expect(warn).not.toHaveBeenCalled();
  });

  it("uses devEngines from package file", () => {
    vi.mocked(existsSync).mockImplementation((path) => path == "cwd/package.json");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ devEngines: { packageManager: { name: "yarn" } } }));

    expect(detectPackageManager("cwd")).toBe("yarn");

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ devEngines: { packageManager: { name: "pnpm" } } }));

    expect(detectPackageManager("cwd")).toBe("pnpm");

    expect(warn).not.toHaveBeenCalled();
  });

  it("ignores unknown package managers", () => {
    vi.mocked(existsSync).mockImplementation((path) => path == "cwd/package.json");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ packageManager: "unknown@1.0.0" }));

    expect(detectPackageManager("cwd")).toBe("npm");

    expect(warn).toHaveBeenCalledExactlyOnceWith("Unknown package manager: unknown");

    warn.mockClear();

    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ devEngines: { packageManager: { name: "unknown" } } }));

    expect(detectPackageManager("cwd")).toBe("npm");

    expect(warn).toHaveBeenCalledExactlyOnceWith("Unknown package manager: unknown");
  });

  it("implies pnpm from pnpm lock file", () => {
    vi.mocked(existsSync).mockImplementation((path) => path == "cwd/pnpm-lock.yaml");

    expect(detectPackageManager("cwd")).toBe("pnpm");
    expect(vi.mocked(existsSync)).toHaveBeenCalledWith("cwd/pnpm-lock.yaml");
  });

  it("implies yarn from yarn lock file", () => {
    vi.mocked(existsSync).mockImplementation((path) => path == "cwd/yarn.lock");

    expect(detectPackageManager("cwd")).toBe("yarn");
    expect(vi.mocked(existsSync)).toHaveBeenCalledWith("cwd/yarn.lock");
  });
});

describe("getVersionPrefix", () => {
  beforeEach(() => {
    vi.mocked(runCommand).mockReset();
  });

  it("passes through the output of npm config get tag-version-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("npm")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("npm config get tag-version-prefix");
  });

  it("passes through the output of yarn config get version-tag-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("yarn")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("yarn config get version-tag-prefix");
  });

  it("passes through the output of pnpm config get tag-version-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("pnpm")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("pnpm config get tag-version-prefix");
  });

  it("returns v if the command output is empty", () => {
    vi.mocked(runCommand).mockReturnValue("");
    expect(getVersionPrefix("npm")).toBe("v");
    expect(getVersionPrefix("yarn")).toBe("v");
    expect(getVersionPrefix("pnpm")).toBe("v");
  });

  it("returns v if the command output is undefined", () => {
    vi.mocked(runCommand).mockReturnValue("undefined");
    expect(getVersionPrefix("npm")).toBe("v");
    expect(getVersionPrefix("yarn")).toBe("v");
    expect(getVersionPrefix("pnpm")).toBe("v");
  });
});
