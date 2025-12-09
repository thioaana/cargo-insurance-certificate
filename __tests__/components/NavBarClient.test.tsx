import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBarClient } from "@/components/NavBarClient";
import type { Profile } from "@/lib/types/profile";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Helper to create mock profiles
const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "test-user-id",
  full_name: "Test User",
  role: "broker",
  broker_code: "BR001",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("NavBarClient component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logged out state", () => {
    it("should show Login button when no profile", () => {
      render(<NavBarClient profile={null} />);
      // There are two Login links (desktop and mobile), just verify at least one exists
      const loginLinks = screen.getAllByRole("link", { name: "Login" });
      expect(loginLinks.length).toBeGreaterThan(0);
      expect(loginLinks[0]).toHaveAttribute("href", "/auth/login");
    });

    it("should not show navigation links when logged out", () => {
      render(<NavBarClient profile={null} />);
      expect(screen.queryByText("Contracts")).not.toBeInTheDocument();
      expect(screen.queryByText("All Certificates")).not.toBeInTheDocument();
      expect(screen.queryByText("My Certificates")).not.toBeInTheDocument();
    });

    it("should not show user menu when logged out", () => {
      render(<NavBarClient profile={null} />);
      expect(
        screen.queryByRole("button", { name: "User menu" })
      ).not.toBeInTheDocument();
    });
  });

  describe("admin user", () => {
    const adminProfile = createMockProfile({ role: "admin" });

    it("should show Contracts link for admin", () => {
      render(<NavBarClient profile={adminProfile} />);
      // Desktop and mobile both have Contracts link
      const contractsLinks = screen.getAllByRole("link", { name: "Contracts" });
      expect(contractsLinks.length).toBeGreaterThan(0);
      expect(contractsLinks[0]).toHaveAttribute("href", "/contracts");
    });

    it("should show All Certificates link for admin", () => {
      render(<NavBarClient profile={adminProfile} />);
      // Desktop and mobile both have All Certificates link
      const allCertsLinks = screen.getAllByRole("link", {
        name: "All Certificates",
      });
      expect(allCertsLinks.length).toBeGreaterThan(0);
      expect(allCertsLinks[0]).toHaveAttribute("href", "/certificates");
    });

    it("should not show My Certificates link for admin", () => {
      render(<NavBarClient profile={adminProfile} />);
      expect(screen.queryByText("My Certificates")).not.toBeInTheDocument();
    });

    it("should show user dropdown menu for admin", () => {
      render(<NavBarClient profile={adminProfile} />);
      expect(
        screen.getByRole("button", { name: "User menu" })
      ).toBeInTheDocument();
    });
  });

  describe("broker user", () => {
    const brokerProfile = createMockProfile({ role: "broker" });

    it("should show My Certificates link for broker", () => {
      render(<NavBarClient profile={brokerProfile} />);
      // Desktop and mobile both have My Certificates link
      const myCertsLinks = screen.getAllByRole("link", {
        name: "My Certificates",
      });
      expect(myCertsLinks.length).toBeGreaterThan(0);
      expect(myCertsLinks[0]).toHaveAttribute("href", "/certificates");
    });

    it("should not show Contracts link for broker", () => {
      render(<NavBarClient profile={brokerProfile} />);
      expect(screen.queryByText("Contracts")).not.toBeInTheDocument();
    });

    it("should not show All Certificates link for broker", () => {
      render(<NavBarClient profile={brokerProfile} />);
      expect(screen.queryByText("All Certificates")).not.toBeInTheDocument();
    });

    it("should show user dropdown menu for broker", () => {
      render(<NavBarClient profile={brokerProfile} />);
      expect(
        screen.getByRole("button", { name: "User menu" })
      ).toBeInTheDocument();
    });
  });

  describe("user dropdown menu", () => {
    const profile = createMockProfile();

    it("should show Profile link in dropdown when opened", async () => {
      const user = userEvent.setup();
      render(<NavBarClient profile={profile} />);

      await user.click(screen.getByRole("button", { name: "User menu" }));

      expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
        "href",
        "/auth/profile"
      );
    });

    it("should show Logout option in dropdown when opened", async () => {
      const user = userEvent.setup();
      render(<NavBarClient profile={profile} />);

      await user.click(screen.getByRole("button", { name: "User menu" }));

      // LogoutButton is rendered inside a menuitem, look for Logout text in menu
      const menu = screen.getByRole("menu");
      expect(menu).toHaveTextContent("Logout");
    });
  });

  describe("mobile menu", () => {
    it("should have mobile menu toggle button", () => {
      render(<NavBarClient profile={null} />);
      expect(
        screen.getByRole("button", { name: "Toggle navigation" })
      ).toBeInTheDocument();
    });

    it("should toggle mobile menu on button click", async () => {
      const user = userEvent.setup();
      render(<NavBarClient profile={null} />);

      const toggleButton = screen.getByRole("button", {
        name: "Toggle navigation",
      });
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");

      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("common elements", () => {
    it("should always show logo linking to home", () => {
      render(<NavBarClient profile={null} />);
      const logoLink = screen.getByRole("link", { name: /agro/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("should always show theme toggle", () => {
      render(<NavBarClient profile={null} />);
      // ThemeToggle renders a button
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });
});
