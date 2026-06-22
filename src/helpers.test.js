import { describe, test, expect, beforeEach } from "vitest";
import { formatCurrency, calculateSpentByBudget } from "./helpers";

describe("formatCurrency", () => {
    test("formats a number as USD", () => {
      const result = formatCurrency(100);
      expect(result).toContain("100");
      expect(result).toContain("$");
    });
  });

  describe("calculateSpentByBudget", () => {
    beforeEach(() => {
      localStorage.clear();
      localStorage.setItem(
        "expenses",
        JSON.stringify([
          { id: "1", budgetId: "b1", amount: 10 },
          { id: "2", budgetId: "b1", amount: 5 },
          { id: "3", budgetId: "b2", amount: 99 },
        ])
      );
    });

    test("sums only expenses for the given budget", () => {
        expect(calculateSpentByBudget("b1")).toBe(15);
      });
    });