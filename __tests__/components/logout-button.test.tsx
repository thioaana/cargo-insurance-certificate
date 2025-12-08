import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

// Mock modules are set up in vitest.setup.tsx

// Get the mocked functions
const mockCreateClient = vi.mocked(createClient);

describe("LogoutButton component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  describe("rendering", () => {
    it("should render a logout button", () => {
      render(<LogoutButton />);
      expect(
        screen.getByRole("button", { name: "Logout" })
      ).toBeInTheDocument();
    });

    it("should render with Button component styling", () => {
      render(<LogoutButton />);
      const button = screen.getByRole("button", { name: "Logout" });
      // Button component has inline-flex class by default
      expect(button).toHaveClass("inline-flex");
    });
  });

  // Logout functionality tests
  describe("logout functionality", () => {
    it("should call signOut when clicked", async () => {
      const user = userEvent.setup();
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
          signOut: mockSignOut,
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: "Logout" }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it("should show success toast after logout", async () => {
      const user = userEvent.setup();
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
          signOut: mockSignOut,
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LogoutButton />);

      await user.click(screen.getByRole("button", { name: "Logout" }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Logged out successfully");
      });
    });
  });

  // Accessibility tests
  describe("accessibility", () => {
    it("should be focusable", () => {
      render(<LogoutButton />);
      const button = screen.getByRole("button", { name: "Logout" });
      button.focus();
      expect(button).toHaveFocus();
    });

    it("should be clickable via keyboard", async () => {
      const user = userEvent.setup();
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });
      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
          signOut: mockSignOut,
          getUser: vi.fn(),
          getSession: vi.fn(),
        },
      } as ReturnType<typeof createClient>);

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: "Logout" });
      button.focus();
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });
  });
});
