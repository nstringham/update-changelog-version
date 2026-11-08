import { describe, it, expect } from "vitest";
import { formatDate } from "../util/format-date.js";

describe("formatDate", () => {
  it("formats a date object into YYYY-MM-DD", () => {
    const date = new Date(2026, 6, 8);
    expect(formatDate(date)).toBe("2026-07-08");
  });
});
