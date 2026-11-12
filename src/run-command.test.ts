import { describe, it, expect } from "vitest";
import { runCommand } from "./run-command.js";

describe("runCommand", () => {
  it("should run an echo command", () => {
    expect(runCommand("echo hello")).toBe("hello");
  });

  it("should throw an error if the command fails", () => {
    expect(() => runCommand("exit 1")).toThrow();
  });
});
