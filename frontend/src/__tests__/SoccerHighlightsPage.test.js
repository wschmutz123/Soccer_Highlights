import { render, screen } from "@testing-library/react";
import SoccerHighlightsPage from "../highlights/pages/SoccerHighlightsPage";
import { BrowserRouter } from "react-router-dom";
import { useTeams } from "../highlights/context/TeamsContext";
import {
  ApolloProvider,
  InMemoryCache,
  ApolloClient,
  HttpLink,
} from "@apollo/client";

jest.spyOn(console, "warn").mockImplementation((msg) => {
  if (msg.includes("React Router Future Flag Warning")) return;
  console.warn(msg);
});

jest.mock("react-hls-player", () => () => (
  <div data-testid="mock-hls-player" />
));

jest.mock("../highlights/context/TeamsContext", () => ({
  useTeams: jest.fn(),
}));

const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:4000/graphql" }),
  cache: new InMemoryCache(),
});

describe("SoccerHighlightsPage", () => {
  beforeEach(() => {
    useTeams.mockReturnValue({
      teams: [{ id: "1", name: "Team A" }],
      isLoading: false,
    });
  });

  it("renders TeamSelector", () => {
    render(
      <ApolloProvider client={client}>
        <BrowserRouter>
          <SoccerHighlightsPage />
        </BrowserRouter>
      </ApolloProvider>
    );

    expect(screen.getByText("Choose a Team")).toBeInTheDocument();
  });
});
