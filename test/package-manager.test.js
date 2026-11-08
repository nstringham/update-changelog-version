// @ts-check

import { describe, it, expect, vi } from "vitest";
import { detectPackageManager } from "../util/package-manager";
import { readFileSync, existsSync } from "node:fs";

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

describe("detectPackageManager", () => {
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
