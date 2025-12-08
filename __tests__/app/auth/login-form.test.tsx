import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/auth/login/login-form";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// Mock modules are set up in vitest.setup.ts

// Get the mocked createClient function
const mockCreateClient = vi.mocked(createClient);

describe("LoginForm component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe("rendering", () => {
    it("should render the login form", () => {
      render(<LoginForm />);
      // Check for the card title "Login" using the text-2xl class (button has different class)
      const title = screen.getByText((content, element) => {
        return content === "Login" && (element?.classList.contains("text-2xl") ?? false);
      });
      expect(title).toBeInTheDocument();
    });

    it("should render email input field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should render password input field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should render login button", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      render(<LoginForm />);
      expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    });

    it("should render sign up link", () => {
      render(<LoginForm />);
      expect(screen.getByText("Sign up")).toBeInTheDocument();
    });

    it("should render description text", () => {
      render(<LoginForm />);
      expect(
        screen.getByText("Enter your email below to login to your account")
      ).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<LoginForm className="custom-class" data-testid="login-form" />);
      expect(screen.getByTestId("login-form")).toHaveClass("custom-class");
    });
  });

  // Input fields tests
  describe("input fields", () => {
    it("should have email input with correct type", () => {
      render(<LoginForm />);
      const emailInput = screen.getByLabelText("Email");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("should have password input with correct type", () => {
      render(<LoginForm />);
      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should have email placeholder", () => {
      render(<LoginForm />);
      expect(screen.getByPlaceholderText("m@example.com")).toBeInTheDocument();
    });

    it("should have required email field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email")).toBeRequired();
    });

    it("should have required password field", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toBeRequired();
    });
  });

  // User input tests
  describe("user input", () => {
    it("should update email value on input", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      await user.type(emailInput, "test@example.com");
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password value on input", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "password123");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  // Form submission tests
  describe("form submission", () => {
    it("should call signInWithPassword on form submit", async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignIn,
          signUp: vi.fn(),
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      // Create a promise that we can control
      let resolveSignIn: (value: { error: null }) => void;
      const signInPromise = new Promise<{ error: null }>((resolve) => {
        resolveSignIn = resolve;
      });

      const mockSignIn = vi.fn().mockReturnValue(signInPromise);
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignIn,
          signUp: vi.fn(),
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Login" }));

      // Check loading state
      expect(screen.getByRole("button", { name: "Logging in..." })).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();

      // Resolve the promise
      resolveSignIn!({ error: null });

      // Wait for loading to end
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
      });
    });

    it("should show success toast on successful login", async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignIn,
          signUp: vi.fn(),
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Logged in successfully");
      });
    });
  });

  // Error handling tests
  describe("error handling", () => {
    it("should display error message on login failure", async () => {
      const user = userEvent.setup();
      const mockSignIn = vi
        .fn()
        .mockResolvedValue({ error: new Error("Invalid credentials") });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignIn,
          signUp: vi.fn(),
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LoginForm />);

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(
          screen.getByText("Invalid email or password. Please try again.")
        ).toBeInTheDocument();
      });
    });

    it("should clear error on new submission", async () => {
      const user = userEvent.setup();
      let callCount = 0;
      const mockSignIn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ error: new Error("Invalid credentials") });
        }
        return Promise.resolve({ error: null });
      });

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignIn,
          signUp: vi.fn(),
          signOut: vi.fn(),
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LoginForm />);

      // First submission - will fail
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: "Login" }));

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText("Invalid email or password. Please try again.")
        ).toBeInTheDocument();
      });

      // Second submission - will succeed
      await user.clear(screen.getByLabelText("Password"));
      await user.type(screen.getByLabelText("Password"), "correct");
      await user.click(screen.getByRole("button", { name: "Login" }));

      // Error should be cleared while loading
      await waitFor(() => {
        expect(
          screen.queryByText("Invalid email or password. Please try again.")
        ).not.toBeInTheDocument();
      });
    });
  });

  // Navigation links tests
  describe("navigation links", () => {
    it("should have correct forgot password link", () => {
      render(<LoginForm />);
      const link = screen.getByText("Forgot your password?");
      expect(link).toHaveAttribute("href", "/auth/forgot-password");
    });

    it("should have correct sign up link", () => {
      render(<LoginForm />);
      const link = screen.getByText("Sign up");
      expect(link).toHaveAttribute("href", "/auth/sign-up");
    });
  });
});
