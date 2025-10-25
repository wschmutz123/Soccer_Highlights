import { render, screen, fireEvent } from "@testing-library/react";
import TeamSelector from "../highlights/components/TeamSelector";
import { useTeams } from "../highlights/context/TeamsContext";
import { BrowserRouter } from "react-router-dom";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

// Mock useTeams from context
jest.mock("../highlights/context/TeamsContext", () => ({
  useTeams: jest.fn(),
}));

// Mock react-router navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("TeamSelector", () => {
  const mockOnSelectTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    useTeams.mockReturnValue({
      teams: [],
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <TeamSelector onSelectTeam={mockOnSelectTeam} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loading teams.../i)).toBeInTheDocument();
  });

  it("renders 'No teams available' when not loading and no teams", () => {
    useTeams.mockReturnValue({
      teams: [],
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TeamSelector onSelectTeam={mockOnSelectTeam} />
      </BrowserRouter>
    );

    expect(screen.getByText(/No teams available/i)).toBeInTheDocument();
  });

  it("renders team options when teams are available", () => {
    useTeams.mockReturnValue({
      teams: [
        { id: "1", name: "Team A" },
        { id: "2", name: "Team B" },
      ],
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TeamSelector onSelectTeam={mockOnSelectTeam} />
      </BrowserRouter>
    );

    // React Select renders the placeholder by default
    expect(screen.getByText("Choose a Team")).toBeInTheDocument();
  });

  it("calls onSelectTeam when a team is selected", () => {
    useTeams.mockReturnValue({
      teams: [
        { id: "1", name: "Team A" },
        { id: "2", name: "Team B" },
      ],
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TeamSelector onSelectTeam={mockOnSelectTeam} />
      </BrowserRouter>
    );

    // Open the react-select dropdown
    const dropdown = screen.getByText("Choose a Team");
    fireEvent.keyDown(dropdown, { key: "ArrowDown" });
    fireEvent.click(screen.getByText("Team A"));

    expect(mockOnSelectTeam).toHaveBeenCalledWith({ id: "1", name: "Team A" });
  });

  it("navigates to '/' if initialTeamId not found", () => {
    useTeams.mockReturnValue({
      teams: [{ id: "1", name: "Team A" }],
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <TeamSelector
          onSelectTeam={mockOnSelectTeam}
          initialTeamId="999" // non-existent ID
        />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
