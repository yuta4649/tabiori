import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts a PostgreSQL connection string", () => {
    const env = parseEnv({
      DATABASE_URL: "postgresql://tabiori:tabiori@localhost:5432/tabiori",
    });
    expect(env.DATABASE_URL).toBe(
      "postgresql://tabiori:tabiori@localhost:5432/tabiori",
    );
    expect(env.NODE_ENV).toBe("development");
  });

  it("rejects a missing DATABASE_URL", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("rejects a non-PostgreSQL URL", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://localhost/db" })).toThrow(
      /DATABASE_URL/,
    );
  });
});
