import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeRedirectPath("/trips/abc")).toBe("/trips/abc");
    expect(safeRedirectPath("/trips/new?x=1")).toBe("/trips/new?x=1");
  });

  it("falls back to /trips for missing or external targets", () => {
    expect(safeRedirectPath(undefined)).toBe("/trips");
    expect(safeRedirectPath(["/trips"])).toBe("/trips");
    expect(safeRedirectPath("https://evil.example.com")).toBe("/trips");
    expect(safeRedirectPath("//evil.example.com")).toBe("/trips");
    expect(safeRedirectPath("/\\evil.example.com")).toBe("/trips");
  });

  it("does not loop back to the login page or into the API", () => {
    expect(safeRedirectPath("/login")).toBe("/trips");
    expect(safeRedirectPath("/login?next=/trips")).toBe("/trips");
    expect(safeRedirectPath("/api/auth/sign-out")).toBe("/trips");
  });
});
