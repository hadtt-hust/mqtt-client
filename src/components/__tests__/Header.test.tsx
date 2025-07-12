import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../Header";

describe("Header", () => {
  it("should render correctly", () => {
    render(<Header />);

    expect(screen.getByText("React MQTT Application")).toBeInTheDocument();
  });

  it("should have correct heading level", () => {
    render(<Header />);

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("React MQTT Application");
  });

  it("should have correct styling classes", () => {
    render(<Header />);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("text-center");
    expect(heading).toHaveClass("mb-4");
  });
});

