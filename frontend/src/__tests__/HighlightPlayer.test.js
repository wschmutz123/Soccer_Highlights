import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import HighlightPlayer, {
  GET_PLAYER_HIGHLIGHTS,
} from "../highlights/components/HighlightPlayer";
import { MockedProvider } from "@apollo/client/testing";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

jest.mock("react-hls-player", () => () => (
  <div data-testid="mock-hls-player" />
));

const mockFetch = (url, options) => {
  if (url.startsWith("https://test/") && options.method === "HEAD") {
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers(),
    });
  }
  return Promise.reject(new Error(`Unexpected fetch request to: ${url}`));
};

// Spy on and replace the global fetch in the test environment
global.fetch = jest.fn(mockFetch);

describe("HighlightPlayer", () => {
  const mockPlayer = {
    id: "101",
    firstName: "Lionel",
    lastName: "Messi",
    name: "Lionel Messi",
    number: 10,
  };

  const mockHighlights = [
    {
      duration: 5,
      event: "Goal",
      game_id: "game1",
      hls_url: "https://test/video1.m3u8",
      offset: 0,
    },
    {
      duration: 7,
      event: "Assist",
      game_id: "game2",
      hls_url: "https://test/video2.m3u8",
      offset: 10,
    },
  ];

  const successMock = {
    request: {
      query: GET_PLAYER_HIGHLIGHTS,
      variables: { teamPlayerId: parseInt(mockPlayer.id, 10) },
    },
    result: {
      data: { teamPlayerMomentsInfo: mockHighlights },
    },
  };

  it("renders placeholder when no player is selected", () => {
    render(
      <MockedProvider>
        <HighlightPlayer player={null} />
      </MockedProvider>
    );

    expect(
      screen.getByText(/Choose a Team and Player to get Highlights/i)
    ).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <HighlightPlayer player={mockPlayer} />
      </MockedProvider>
    );

    expect(
      screen.getByText(/Loading highlights for Lionel Messi/i)
    ).toBeInTheDocument();
  });

  it("renders highlights and displays first highlight info", async () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <HighlightPlayer player={mockPlayer} />
      </MockedProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Check that first highlight event is rendered
    const events = screen.getAllByText(/Goal/i);
    expect(events[0]).toBeInTheDocument();

    // Player initials
    expect(screen.getByText(/LM/i)).toBeInTheDocument();

    // Player name and number
    expect(screen.getByText(/Lionel Messi/i)).toBeInTheDocument();
    expect(screen.getByText(/#10/i)).toBeInTheDocument();
  });

  it("handles video error overlay", async () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <HighlightPlayer player={mockPlayer} />
      </MockedProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() =>
      expect(screen.getByText(/Couldn't load video/i)).toBeInTheDocument()
    );

    // Close error overlay
    fireEvent.click(screen.getByText("✖"));

    expect(screen.queryByText(/Couldn't load video/i)).not.toBeInTheDocument();
  });
});
