import React, { useState, useEffect, useCallback, useRef } from "react";

import "./TeamSelector.css";

const API_URL = "https://lapi.traceup.com/upload-dev/data/db-ro/query";

/**
 * TeamSelector Component
 * @param {object} props - Component props
 * @param {function} props.onSelectTeam - Callback function when a team is selected
 */
const TeamSelector = ({ onSelectTeam, initialTeamId, onTeamsLoaded }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);
  /*
  const fetchTeams = useCallback(async () => {
    try {
      const responseData = await sendRequest(
        `${API_URL}`,
        "POST",
        JSON.stringify({
          query: [
            {
              type: "query",
              table: "test_top_teams",
              data: {},
            },
          ],
        }),
        { "Content-Type": "application/json" }
      );
      const fetchedTeams = responseData?.result[0]?.data?.data || [];

      const standardizedTeams = fetchedTeams
        .map((team) => ({
          id: team.team_hash, // Use team_hash as the unique ID
          name: team.title, // Use title as the display name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (onTeamsLoaded) onTeamsLoaded();

      setTeams(standardizedTeams);
    } catch (err) {}
  }, [sendRequest]);
  */

  const fetchTeams = async () => {
    try {
      setIsLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Mock API response
      const mockResponse = {
        success: true,
        result: [
          {
            ok: true,
            data: {
              type: "query",
              data: [
                {
                  team_hash: "1mkaqhhw",
                  title: "Union County Co-Ed FC",
                  num_games: 21,
                },
                {
                  team_hash: "lclk7b38",
                  title: "SS Soccer Academy",
                  num_games: 21,
                },
                {
                  team_hash: "bng4bmzj",
                  title: "Campton United 2015/2016/2017/2018 Girls",
                  num_games: 18,
                },
                {
                  team_hash: "4qfyh3tu",
                  title: "Charleston Catholic Middle School Boys Soccer",
                  num_games: 18,
                },
                {
                  team_hash: "qiwcpkhb",
                  title: "Apex Strikers",
                  num_games: 17,
                },
              ],
            },
          },
        ],
      };

      // Extract and standardize team data
      const fetchedTeams = mockResponse?.result[0]?.data?.data || [];
      const standardizedTeams = fetchedTeams
        .map((team) => ({
          id: team.team_hash,
          name: team.title.trim(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (onTeamsLoaded) onTeamsLoaded();

      setTeams(standardizedTeams);
    } catch (err) {
      console.error("Error fetching mock teams:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // --- 2. Initialization Logic (Runs when teams data arrives OR initialTeamId changes) ---
  useEffect(() => {
    if (teams.length === 0 || initialized.current) return;

    let initialTeam = null;
    if (initialTeamId) {
      initialTeam = teams.find((t) => t.id === initialTeamId);
    }

    if (initialTeam) {
      setSelectedTeamId(initialTeam.id);
      onSelectTeam(initialTeam); // notify parent
    } else {
      // No initialTeamId, keep dropdown at placeholder
      setSelectedTeamId(""); // shows "Choose a Team"
    }

    initialized.current = true;
  }, [teams, initialTeamId, onSelectTeam]);

  // 2. Handle dropdown change
  const handleTeamChange = (event) => {
    const id = event.target.value;
    setSelectedTeamId(id);

    if (!id) {
      // User selected "Choose a Team"
      onSelectTeam(null);
      return;
    }

    // Find the full team object and pass it up to the parent
    const teamObject = teams.find((t) => t.id === id);

    if (teamObject) {
      onSelectTeam(teamObject);
    }
  };

  if (isLoading) {
    return <div className="team-selector-loading">Loading teams...</div>;
  }

  if (teams.length === 0) {
    return <div className="team-selector-error">No teams available.</div>;
  }

  return (
    <div className="team-selector-container">
      <select
        id="team-select"
        className="team-selector-dropdown"
        value={selectedTeamId}
        onChange={handleTeamChange}
      >
        <option value="">Choose a Team</option>

        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamSelector;
