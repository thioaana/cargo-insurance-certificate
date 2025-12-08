import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonVariants } from "@/components/ui/button";
import { createRef } from "react";

// Tests for the Button component
// Button supports variants, sizes, and can render as different elements via asChild
describe("Button component", () => {
  // Basic rendering
  describe("rendering", () => {
    it("should render with children", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("should render as a button element by default", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have correct displayName", () => {
      expect(Button.displayName).toBe("Button");
    });
  });

  // Variant tests
  describe("variants", () => {
    it("should render default variant", () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("should render destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("bg-background");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });

    it("should render link variant", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("underline-offset-4");
    });
  });

  // Size tests
  describe("sizes", () => {
    it("should render default size", () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
      expect(button).toHaveClass("px-4");
    });

    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
      expect(button).toHaveClass("px-3");
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
      expect(button).toHaveClass("px-8");
    });

    it("should render icon size", () => {
      render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
      expect(button).toHaveClass("w-9");
    });
  });

  // Event handling
  describe("interactions", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Disabled state
  describe("disabled state", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
    });
  });

  // Ref forwarding
  describe("ref forwarding", () => {
    it("should forward ref to button element", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe("Ref Button");
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should merge custom className with default classes", () => {
      render(<Button className="my-custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("my-custom-class");
      expect(button).toHaveClass("inline-flex"); // default class
    });

    it("should allow className to override default styles", () => {
      render(<Button className="h-12">Override Height</Button>);
      const button = screen.getByRole("button");
      // tailwind-merge should resolve the conflict
      expect(button).toHaveClass("h-12");
    });
  });

  // asChild prop (Radix Slot)
  describe("asChild prop", () => {
    it("should render as child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Link Button" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });
  });

  // Button type attribute
  describe("button type", () => {
    it("should accept type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  // buttonVariants helper
  describe("buttonVariants helper", () => {
    it("should generate class string for default variant", () => {
      const classes = buttonVariants({ variant: "default", size: "default" });
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("h-9");
    });

    it("should generate class string for custom combinations", () => {
      const classes = buttonVariants({ variant: "destructive", size: "lg" });
      expect(classes).toContain("bg-destructive");
      expect(classes).toContain("h-10");
    });
  });
});
