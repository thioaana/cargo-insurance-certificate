import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createRef } from "react";

// Tests for the Card component family
// Card provides a set of composable components for card layouts
describe("Card components", () => {
  // Card (root)
  describe("Card", () => {
    it("should render a div element", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card.tagName.toLowerCase()).toBe("div");
    });

    it("should render children", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-xl");
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("bg-card");
      expect(card).toHaveClass("shadow");
    });

    it("should have correct displayName", () => {
      expect(Card.displayName).toBe("Card");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <Card className="my-custom-class" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("my-custom-class");
      expect(card).toHaveClass("rounded-xl");
    });
  });

  // CardHeader
  describe("CardHeader", () => {
    it("should render children", () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<CardHeader data-testid="header">Content</CardHeader>);
      const header = screen.getByTestId("header");
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("flex-col");
      expect(header).toHaveClass("space-y-1.5");
      expect(header).toHaveClass("p-6");
    });

    it("should have correct displayName", () => {
      expect(CardHeader.displayName).toBe("CardHeader");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Content</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <CardHeader className="my-header-class" data-testid="header">
          Content
        </CardHeader>
      );
      expect(screen.getByTestId("header")).toHaveClass("my-header-class");
    });
  });

  // CardTitle
  describe("CardTitle", () => {
    it("should render children", () => {
      render(<CardTitle>My Title</CardTitle>);
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId("title");
      expect(title).toHaveClass("font-semibold");
      expect(title).toHaveClass("leading-none");
      expect(title).toHaveClass("tracking-tight");
    });

    it("should have correct displayName", () => {
      expect(CardTitle.displayName).toBe("CardTitle");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <CardTitle className="text-2xl" data-testid="title">
          Title
        </CardTitle>
      );
      expect(screen.getByTestId("title")).toHaveClass("text-2xl");
    });
  });

  // CardDescription
  describe("CardDescription", () => {
    it("should render children", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(
        <CardDescription data-testid="desc">Description</CardDescription>
      );
      const desc = screen.getByTestId("desc");
      expect(desc).toHaveClass("text-sm");
      expect(desc).toHaveClass("text-muted-foreground");
    });

    it("should have correct displayName", () => {
      expect(CardDescription.displayName).toBe("CardDescription");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<CardDescription ref={ref}>Desc</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <CardDescription className="text-base" data-testid="desc">
          Desc
        </CardDescription>
      );
      expect(screen.getByTestId("desc")).toHaveClass("text-base");
    });
  });

  // CardContent
  describe("CardContent", () => {
    it("should render children", () => {
      render(<CardContent>Content here</CardContent>);
      expect(screen.getByText("Content here")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("p-6");
      expect(content).toHaveClass("pt-0");
    });

    it("should have correct displayName", () => {
      expect(CardContent.displayName).toBe("CardContent");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <CardContent className="p-4" data-testid="content">
          Content
        </CardContent>
      );
      expect(screen.getByTestId("content")).toHaveClass("p-4");
    });
  });

  // CardFooter
  describe("CardFooter", () => {
    it("should render children", () => {
      render(<CardFooter>Footer Content</CardFooter>);
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });

    it("should apply default styling", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
      expect(footer).toHaveClass("p-6");
      expect(footer).toHaveClass("pt-0");
    });

    it("should have correct displayName", () => {
      expect(CardFooter.displayName).toBe("CardFooter");
    });

    it("should forward ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("should merge custom className", () => {
      render(
        <CardFooter className="justify-between" data-testid="footer">
          Footer
        </CardFooter>
      );
      expect(screen.getByTestId("footer")).toHaveClass("justify-between");
    });
  });

  // Composition test
  describe("composition", () => {
    it("should compose all card parts together", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      );

      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description text")).toBeInTheDocument();
      expect(screen.getByText("Main content goes here")).toBeInTheDocument();
      expect(screen.getByText("Footer actions")).toBeInTheDocument();
    });

    it("should maintain correct DOM structure", () => {
      render(
        <Card data-testid="structured-card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );

      const card = screen.getByTestId("structured-card");
      const header = screen.getByTestId("header");
      const title = screen.getByTestId("title");
      const content = screen.getByTestId("content");

      expect(card).toContainElement(header);
      expect(header).toContainElement(title);
      expect(card).toContainElement(content);
    });
  });
});
