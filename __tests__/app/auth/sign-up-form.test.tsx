import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "@/app/auth/sign-up/sign-up-form";
import { createClient } from "@/lib/supabase/client";

// Mock modules are set up in vitest.setup.ts

// Get the mocked createClient function
const mockCreateClient = vi.mocked(createClient);

describe("SignUpForm component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin for emailRedirectTo
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
  });

  // Rendering tests
  describe("rendering", () => {
    it("should render the sign up form", () => {
      render(<SignUpForm />);
      // Check for the card title "Sign up" using the text-2xl class (button has different class)
      const title = screen.getByText((content, element) => {
        return content === "Sign up" && (element?.classList.contains("text-2xl") ?? false);
      });
      expect(title).toBeInTheDocument();
    });

    it("should render full name input field", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    it("should render email input field", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should render password input field", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should render repeat password input field", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText("Repeat Password")).toBeInTheDocument();
    });

    it("should render sign up button", () => {
      render(<SignUpForm />);
      expect(
        screen.getByRole("button", { name: "Sign up" })
      ).toBeInTheDocument();
    });

    it("should render login link", () => {
      render(<SignUpForm />);
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("should render description text", () => {
      render(<SignUpForm />);
      expect(screen.getByText("Create a new account")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<SignUpForm className="custom-class" data-testid="signup-form" />);
      expect(screen.getByTestId("signup-form")).toHaveClass("custom-class");
    });
  });

  // Input fields tests
  describe("input fields", () => {
    it("should have full name input with correct type", () => {
      render(<SignUpForm />);
      const input = screen.getByLabelText("Full name");
      expect(input).toHaveAttribute("type", "text");
    });

    it("should have email input with correct type", () => {
      render(<SignUpForm />);
      const emailInput = screen.getByLabelText("Email");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have password input with correct type", () => {
      render(<SignUpForm />);
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have repeat password input with correct type", () => {
      render(<SignUpForm />);
      const repeatPasswordInput = screen.getByLabelText("Repeat Password");
      expect(repeatPasswordInput).toHaveAttribute("type", "password");
    });

    it("should have email placeholder", () => {
      render(<SignUpForm />);
      expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    });

    it("should have all fields required", () => {
      render(<SignUpForm />);
      expect(screen.getByLabelText("Full name")).toBeRequired();
      expect(screen.getByLabelText("Email")).toBeRequired();
      expect(screen.getByLabelText("Password")).toBeRequired();
      expect(screen.getByLabelText("Repeat Password")).toBeRequired();
    });
  });

  // User input tests
  describe("user input", () => {
    it("should update full name value on input", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const input = screen.getByLabelText("Full name");
      await user.type(input, "John Doe");
      expect(input).toHaveValue("John Doe");
    });

    it("should update email value on input", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText("Email");
      await user.type(emailInput, "test@example.com");
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "password123");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should update repeat password value on input", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const repeatPasswordInput = screen.getByLabelText("Repeat Password");
      await user.type(repeatPasswordInput, "password123");
      expect(repeatPasswordInput).toHaveValue("password123");
    });
  });

  // Password validation tests
  describe("password validation", () => {
    it("should show error when passwords do not match", async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "differentpassword");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });

      // signUp should NOT be called when passwords don't match
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("should not show error when passwords match", async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      await waitFor(() => {
        expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
      });
    });
  });

  // Form submission tests
  describe("form submission", () => {
    it("should call signUp on form submit with matching passwords", async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
          options: {
            data: { full_name: "John Doe" },
            emailRedirectTo: "http://localhost:3000/dashboard",
          },
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      // Create a promise that we can control
      let resolveSignUp: (value: { error: null }) => void;
      const signUpPromise = new Promise<{ error: null }>((resolve) => {
        resolveSignUp = resolve;
      });

      const mockSignUp = vi.fn().mockReturnValue(signUpPromise);
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      // Check loading state
      expect(
        screen.getByRole("button", { name: "Creating an account..." })
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();

      // Resolve the promise
      resolveSignUp!({ error: null });

      // Wait for loading to end
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Sign up" })
        ).toBeInTheDocument();
      });
    });
  });

  // Error handling tests
  describe("error handling", () => {
    it("should display error message on signup failure", async () => {
      const user = userEvent.setup();
      const mockSignUp = vi
        .fn()
        .mockResolvedValue({ error: new Error("Email already registered") });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "existing@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      await waitFor(() => {
        expect(
          screen.getByText("Unable to create account. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("should clear error on new submission", async () => {
      const user = userEvent.setup();
      let callCount = 0;
      const mockSignUp = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ error: new Error("Error") });
        }
        return Promise.resolve({ error: null });
      });

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: mockSignUp,
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<SignUpForm />);

      // First submission - will fail
      await user.type(screen.getByLabelText("Full name"), "John Doe");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Repeat Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText("Unable to create account. Please try again.")
        ).toBeInTheDocument();
      });

      // Second submission - will succeed
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      // Error should be cleared while loading
      await waitFor(() => {
        expect(
          screen.queryByText("Unable to create account. Please try again.")
        ).not.toBeInTheDocument();
      });
    });
  });

  // Navigation links tests
  describe("navigation links", () => {
    it("should have correct login link", () => {
      render(<SignUpForm />);
      const link = screen.getByText("Login");
      expect(link).toHaveAttribute("href", "/auth/login");
    });
  });
});
