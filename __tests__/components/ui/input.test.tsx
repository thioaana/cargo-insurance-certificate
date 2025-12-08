import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";
import { createRef } from "react";

// Tests for the Input component
// Input is a styled wrapper around the native input element
describe("Input component", () => {
  // Basic rendering
  describe("rendering", () => {
    it("should render an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should have correct displayName", () => {
      expect(Input.displayName).toBe("Input");
    });

    it("should apply default styling classes", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("flex");
      expect(input).toHaveClass("h-9");
      expect(input).toHaveClass("w-full");
      expect(input).toHaveClass("rounded-md");
    });
  });

  // Input types
  describe("input types", () => {
    it("should render as text input by default (no explicit type)", () => {
      render(<Input />);
      // Input component doesn't set type explicitly, browser defaults to text
      // The role "textbox" confirms it behaves as a text input
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render email type", () => {
      render(<Input type="email" />);
      // email inputs don't have a specific role, query by placeholder or test id
      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it("should render password type", () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("should render number type", () => {
      render(<Input type="number" />);
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });
  });

  // Placeholder
  describe("placeholder", () => {
    it("should display placeholder text", () => {
      render(<Input placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });
  });

  // Value handling
  describe("value handling", () => {
    it("should display controlled value", () => {
      render(<Input value="test value" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("test value");
    });

    it("should call onChange when value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "hello");
      expect(handleChange).toHaveBeenCalled();
    });

    it("should update value on user input", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox");
      await user.type(input, "hello world");
      expect(input).toHaveValue("hello world");
    });
  });

  // Disabled state
  describe("disabled state", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toHaveClass("disabled:cursor-not-allowed");
      expect(screen.getByRole("textbox")).toHaveClass("disabled:opacity-50");
    });

    it("should not allow input when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "test");
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Required attribute
  describe("required attribute", () => {
    it("should be required when required prop is true", () => {
      render(<Input required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });
  });

  // Ref forwarding
  describe("ref forwarding", () => {
    it("should forward ref to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("should allow focusing via ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should merge custom className with default classes", () => {
      render(<Input className="my-custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("my-custom-class");
      expect(input).toHaveClass("flex"); // default class
    });

    it("should allow className to override default styles", () => {
      render(<Input className="h-12" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("h-12");
    });
  });

  // Accessibility
  describe("accessibility", () => {
    it("should support aria-label", () => {
      render(<Input aria-label="Email input" />);
      expect(screen.getByLabelText("Email input")).toBeInTheDocument();
    });

    it("should support id for label association", () => {
      render(
        <>
          <label htmlFor="email">Email</label>
          <Input id="email" />
        </>
      );
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });
  });

  // Additional HTML attributes
  describe("HTML attributes", () => {
    it("should support name attribute", () => {
      render(<Input name="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
    });

    it("should support maxLength attribute", () => {
      render(<Input maxLength={50} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "50");
    });

    it("should support autoComplete attribute", () => {
      render(<Input autoComplete="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("autoComplete", "email");
    });
  });
});
