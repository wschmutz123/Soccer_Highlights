import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HighlightControlPanel from "../highlights/components/HighlightControlPanel";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

describe("HighlightControlPanel", () => {
  const mockOnPlayPause = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all control buttons", () => {
    render(
      <HighlightControlPanel
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
      />
    );

    // Check all button tooltips exist
    expect(screen.getByTitle("Previous Highlight")).toBeInTheDocument();
    expect(screen.getByTitle("Rewind 5s")).toBeInTheDocument();
    expect(screen.getByTitle("Play")).toBeInTheDocument();
    expect(screen.getByTitle("Forward 5s")).toBeInTheDocument();
    expect(screen.getByTitle("Next Highlight")).toBeInTheDocument();
  });

  it("calls correct handlers when buttons are clicked", () => {
    render(
      <HighlightControlPanel
        isPlaying={false}
        onPlayPause={mockOnPlayPause}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
      />
    );

    fireEvent.click(screen.getByTitle("Previous Highlight"));
    expect(mockOnPrevious).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("Rewind 5s"));
    expect(mockOnSkip).toHaveBeenCalledWith(-5);

    fireEvent.click(screen.getByTitle("Play"));
    expect(mockOnPlayPause).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("Forward 5s"));
    expect(mockOnSkip).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByTitle("Next Highlight"));
    expect(mockOnNext).toHaveBeenCalled();
  });

  it("renders Pause icon when isPlaying is true", () => {
    render(
      <HighlightControlPanel
        isPlaying={true}
        onPlayPause={mockOnPlayPause}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByTitle("Pause")).toBeInTheDocument();
  });
});
