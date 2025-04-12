import { describe, expect, it } from "vitest";
import { useBlockchain } from "../src";

describe("Common blockchain functionality", () => {
  // In the future, add tests for generic blockchain functionality
  it("should expose useBlockchain function", () => {
    expect(typeof useBlockchain).toBe("function");
  });
});