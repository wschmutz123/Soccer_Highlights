import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PlayerList, {
  GET_TEAM_MEMBERS,
} from "../highlights/components/PlayerList";
import { MockedProvider } from "@apollo/client/testing";
import { BrowserRouter } from "react-router-dom";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

describe("PlayerList", () => {
  const mockTeam = { id: "team123", name: "Barcelona" };
  const mockOnSelectPlayer = jest.fn();
  const mockOnPlayersLoaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  const mockPlayers = [
    {
      team_player_id: "1",
      is_player: true,
      jersey_number: "10",
      user: { user_id: "101", first_name: "Lionel", last_name: "Messi" },
    },
    {
      team_player_id: "2",
      is_player: true,
      jersey_number: "8",
      user: { user_id: "102", first_name: "Andres", last_name: "Iniesta" },
    },
  ];

  const successMock = {
    request: {
      query: GET_TEAM_MEMBERS,
      variables: { teamHash: mockTeam.id },
    },
    result: {
      data: { teamMembers: mockPlayers },
    },
  };

  it("renders message when no team is selected", () => {
    render(
      <MockedProvider>
        <BrowserRouter>
          <PlayerList team={null} />
        </BrowserRouter>
      </MockedProvider>
    );

    expect(screen.getByText(/Please select a team/i)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <BrowserRouter>
          <PlayerList team={mockTeam} />
        </BrowserRouter>
      </MockedProvider>
    );

    expect(
      screen.getByText(/Loading players for Barcelona/i)
    ).toBeInTheDocument();
  });

  it("renders 'No players found' when no players are returned", async () => {
    const emptyMock = {
      request: {
        query: GET_TEAM_MEMBERS,
        variables: { teamHash: mockTeam.id },
      },
      result: { data: { teamMembers: [] } },
    };

    render(
      <MockedProvider mocks={[emptyMock]}>
        <BrowserRouter>
          <PlayerList team={mockTeam} />
        </BrowserRouter>
      </MockedProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/No players found for Barcelona/i)
      ).toBeInTheDocument()
    );
  });

  it("renders list of players and calls onPlayersLoaded", async () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <BrowserRouter>
          <PlayerList
            team={mockTeam}
            onPlayersLoaded={mockOnPlayersLoaded}
            onSelectPlayer={mockOnSelectPlayer}
          />
        </BrowserRouter>
      </MockedProvider>
    );

    await waitFor(() =>
      expect(screen.getByText(/Lionel Messi/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/Andres Iniesta/i)).toBeInTheDocument();
    expect(mockOnPlayersLoaded).toHaveBeenCalledTimes(1);
  });

  it("disables player click for 1 second after selection", async () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <BrowserRouter>
          <PlayerList
            team={mockTeam}
            onPlayersLoaded={mockOnPlayersLoaded}
            onSelectPlayer={mockOnSelectPlayer}
          />
        </BrowserRouter>
      </MockedProvider>
    );

    const player = await screen.findByText(/Lionel Messi/i);

    // First click
    fireEvent.click(player);
    expect(mockOnSelectPlayer).toHaveBeenCalledTimes(1);

    // Immediate second click should not call handler
    fireEvent.click(player);
    expect(mockOnSelectPlayer).toHaveBeenCalledTimes(1);

    // Advance timers by 1 second inside act
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Now click again
    fireEvent.click(player);
    expect(mockOnSelectPlayer).toHaveBeenCalledTimes(2);
  });
});
