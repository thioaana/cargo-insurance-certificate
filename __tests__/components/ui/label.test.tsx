import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";
import { createRef } from "react";

// Tests for the Label component
// Label is a Radix UI label primitive with custom styling
describe("Label component", () => {
  // Basic rendering
  describe("rendering", () => {
    it("should render a label element", () => {
      render(<Label>Email</Label>);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should render with correct element tag", () => {
      render(<Label>Email</Label>);
      const label = screen.getByText("Email");
      expect(label.tagName.toLowerCase()).toBe("label");
    });

    it("should apply default styling classes", () => {
      render(<Label>Email</Label>);
      const label = screen.getByText("Email");
      expect(label).toHaveClass("text-sm");
      expect(label).toHaveClass("font-medium");
      expect(label).toHaveClass("leading-none");
    });
  });

  // htmlFor association
  describe("htmlFor association", () => {
    it("should associate with input via htmlFor", () => {
      render(
        <>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </>
      );
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email");
    });

    it("should make input accessible via label click", () => {
      render(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <input id="test-input" type="text" />
        </>
      );
      expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });
  });

  // Ref forwarding
  describe("ref forwarding", () => {
    it("should forward ref to label element", () => {
      const ref = createRef<HTMLLabelElement>();
      render(<Label ref={ref}>Email</Label>);

      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
      expect(ref.current?.textContent).toBe("Email");
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should merge custom className with default classes", () => {
      render(<Label className="my-custom-class">Email</Label>);
      const label = screen.getByText("Email");
      expect(label).toHaveClass("my-custom-class");
      expect(label).toHaveClass("text-sm"); // default class
    });

    it("should allow className to override default styles", () => {
      render(<Label className="text-lg">Large Label</Label>);
      const label = screen.getByText("Large Label");
      expect(label).toHaveClass("text-lg");
    });
  });

  // Peer-disabled styling
  describe("peer-disabled styling", () => {
    it("should have peer-disabled classes for sibling disabled inputs", () => {
      render(<Label>Email</Label>);
      const label = screen.getByText("Email");
      expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
      expect(label).toHaveClass("peer-disabled:opacity-70");
    });
  });

  // Children rendering
  describe("children", () => {
    it("should render text children", () => {
      render(<Label>Simple text</Label>);
      expect(screen.getByText("Simple text")).toBeInTheDocument();
    });

    it("should render complex children", () => {
      render(
        <Label>
          <span>Email</span>
          <span className="text-red-500">*</span>
        </Label>
      );
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  // HTML attributes
  describe("HTML attributes", () => {
    it("should pass through additional HTML attributes", () => {
      render(<Label data-testid="my-label">Email</Label>);
      expect(screen.getByTestId("my-label")).toBeInTheDocument();
    });
  });
});
