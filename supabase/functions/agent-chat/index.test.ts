import { describe, expect, test } from "bun:test";
import { createSearchQueries } from "./search-utils";

describe("createSearchQueries", () => {
  test("generates variants for summary queries", () => {
    const queries = createSearchQueries("summary of custom home projects");
    expect(queries).toContain("custom home projects");
    expect(queries).toContain("custom home projects project");
    // Should include partial phrase generated by preprocessSearchText
    expect(queries).toContain("custom home");
  });
});
