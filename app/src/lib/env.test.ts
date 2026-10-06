import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = {
  DATABASE_URL: "postgresql://tabiori:tabiori@localhost:5432/tabiori",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
  it("accepts a valid environment", () => {
    const env = parseEnv(valid);
    expect(env.DATABASE_URL).toBe(valid.DATABASE_URL);
    expect(env.NODE_ENV).toBe("development");
    expect(env.BETTER_AUTH_TRUSTED_ORIGINS).toEqual([]);
  });

  it("rejects a missing DATABASE_URL", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: undefined })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("rejects a non-PostgreSQL URL", () => {
    expect(() =>
      parseEnv({ ...valid, DATABASE_URL: "mysql://localhost/db" }),
    ).toThrow(/DATABASE_URL/);
  });

  it("rejects a short auth secret", () => {
    expect(() => parseEnv({ ...valid, BETTER_AUTH_SECRET: "short" })).toThrow(
      /BETTER_AUTH_SECRET/,
    );
  });

  it("parses trusted origins as a comma-separated list", () => {
    const env = parseEnv({
      ...valid,
      BETTER_AUTH_TRUSTED_ORIGINS:
        "http://192.168.0.10:3000, https://tabiori.example.com",
    });
    expect(env.BETTER_AUTH_TRUSTED_ORIGINS).toEqual([
      "http://192.168.0.10:3000",
      "https://tabiori.example.com",
    ]);
  });
});
