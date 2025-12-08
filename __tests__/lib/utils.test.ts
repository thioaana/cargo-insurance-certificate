import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

// Tests for the cn() utility function
// cn() merges class names using clsx and tailwind-merge
describe("cn utility function", () => {
  // Basic functionality tests
  describe("basic class merging", () => {
    it("should return empty string for no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should return single class unchanged", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("should merge multiple classes", () => {
      expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
    });

    it("should handle array of classes", () => {
      expect(cn(["text-red-500", "bg-blue-500"])).toBe(
        "text-red-500 bg-blue-500"
      );
    });
  });

  // Conditional class handling
  describe("conditional classes", () => {
    it("should filter out falsy values (false)", () => {
      expect(cn("text-red-500", false)).toBe("text-red-500");
    });

    it("should filter out falsy values (null)", () => {
      expect(cn("text-red-500", null)).toBe("text-red-500");
    });

    it("should filter out falsy values (undefined)", () => {
      expect(cn("text-red-500", undefined)).toBe("text-red-500");
    });

    it("should filter out empty strings", () => {
      expect(cn("text-red-500", "")).toBe("text-red-500");
    });

    it("should handle conditional expressions", () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
        "base active"
      );
    });
  });

  // Tailwind class conflict resolution
  describe("Tailwind class conflict resolution", () => {
    it("should resolve conflicting text colors (last wins)", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should resolve conflicting background colors", () => {
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("should resolve conflicting padding", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");
    });

    it("should resolve conflicting margin", () => {
      expect(cn("m-2", "m-4")).toBe("m-4");
    });

    it("should resolve conflicting widths", () => {
      expect(cn("w-full", "w-1/2")).toBe("w-1/2");
    });

    it("should not conflict different directional utilities", () => {
      // px and py are different utilities, should both be present
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("should resolve same directional utilities", () => {
      expect(cn("px-4", "px-8")).toBe("px-8");
    });
  });

  // Object syntax
  describe("object syntax", () => {
    it("should handle object with true values", () => {
      expect(cn({ "text-red-500": true, "bg-blue-500": true })).toBe(
        "text-red-500 bg-blue-500"
      );
    });

    it("should handle object with false values", () => {
      expect(cn({ "text-red-500": true, "bg-blue-500": false })).toBe(
        "text-red-500"
      );
    });

    it("should handle mixed string and object", () => {
      expect(cn("base-class", { active: true, disabled: false })).toBe(
        "base-class active"
      );
    });
  });

  // Real-world usage patterns from the codebase
  describe("real-world usage patterns", () => {
    it("should handle component className override pattern", () => {
      // Common pattern: base classes + optional className prop
      const baseClasses = "flex items-center justify-center rounded-md";
      const userClassName = "mt-4";
      expect(cn(baseClasses, userClassName)).toBe(
        "flex items-center justify-center rounded-md mt-4"
      );
    });

    it("should handle variant override pattern", () => {
      // Pattern used in Button component
      const defaultVariant = "bg-primary text-primary-foreground";
      const overrideClass = "bg-destructive";
      expect(cn(defaultVariant, overrideClass)).toBe(
        "text-primary-foreground bg-destructive"
      );
    });

    it("should handle responsive class combinations", () => {
      expect(cn("text-sm", "md:text-base", "lg:text-lg")).toBe(
        "text-sm md:text-base lg:text-lg"
      );
    });

    it("should handle hover and focus states", () => {
      expect(cn("bg-white", "hover:bg-gray-100", "focus:ring-2")).toBe(
        "bg-white hover:bg-gray-100 focus:ring-2"
      );
    });
  });
});
