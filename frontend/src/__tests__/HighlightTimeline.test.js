import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import HighlightTimeline from "../highlights/components/HighlightTimeline";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

describe("HighlightControlTimeline", () => {
  const mockOnSelectHighlight = jest.fn();
  const mockHighlights = [
    { event: "Goal", duration: 7.54 },
    { event: "Assist", duration: 4.54 },
    { event: "Save", duration: 2.5 },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders all highlight buttons with event names and durations", () => {
    render(
      <HighlightTimeline
        highlights={mockHighlights}
        currentHighlightIndex={1}
        onSelectHighlight={mockOnSelectHighlight}
      />
    );

    expect(screen.getByText("Goal (7.54s)")).toBeInTheDocument();
    expect(screen.getByText("Assist (4.54s)")).toBeInTheDocument();
    expect(screen.getByText("Save (2.50s)")).toBeInTheDocument();
  });

  it("applies the 'active' class to the current highlight", () => {
    render(
      <HighlightTimeline
        highlights={mockHighlights}
        currentHighlightIndex={1}
        onSelectHighlight={mockOnSelectHighlight}
      />
    );

    const activeButton = screen.getByText("Assist (4.54s)");
    expect(activeButton).toHaveClass("active");
  });

  it("calls onSelectHighlight when a button is clicked", () => {
    render(
      <HighlightTimeline
        highlights={mockHighlights}
        currentHighlightIndex={1}
        onSelectHighlight={mockOnSelectHighlight}
      />
    );

    act(() => {
      fireEvent.click(screen.getByText("Save (2.50s)"));
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(mockOnSelectHighlight).toHaveBeenCalledWith(2);
  });

  it("disables all buttons after a click and re-enables them after 1 second", () => {
    render(
      <HighlightTimeline
        highlights={mockHighlights}
        currentHighlightIndex={1}
        onSelectHighlight={mockOnSelectHighlight}
      />
    );

    const goalButton = screen.getByText("Goal (7.54s)");

    expect(goalButton).not.toBeDisabled();

    act(() => {
      fireEvent.click(goalButton);
    });

    expect(goalButton).toBeDisabled();

    act(() => {
      jest.runAllTimers();
    });

    expect(goalButton).not.toBeDisabled();
  });
});
