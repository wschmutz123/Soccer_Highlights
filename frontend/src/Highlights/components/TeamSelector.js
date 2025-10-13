import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHttpClient } from "../../Shared/hooks/http-hook";

import "./TeamSelector.css";

const API_URL = "https://lapi.traceup.com/upload-dev/data/db-ro/query";

/**
 * TeamSelector Component
 * @param {object} props - Component props
 * @param {function} props.onSelectTeam - Callback function when a team is selected
 */
const TeamSelector = ({ onSelectTeam, initialTeamId }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const initialized = useRef(false);

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

      const standardizedTeams = fetchedTeams.map((team) => ({
        id: team.team_hash, // Use team_hash as the unique ID
        name: team.title, // Use title as the display name
      }));

      setTeams(standardizedTeams);
    } catch (err) {}
  }, [sendRequest]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // --- 2. Initialization Logic (Runs when teams data arrives OR initialTeamId changes) ---
  useEffect(() => {
    if (teams.length === 0 || initialized.current) return;

    if (initialTeamId) {
      const initialTeam = teams.find((t) => t.id === initialTeamId);
      if (initialTeam) {
        setSelectedTeamId(initialTeam.id);
        onSelectTeam(initialTeam);
      }
    }

    initialized.current = true; // mark as done
  }, [teams, initialTeamId, onSelectTeam]);

  // 2. Handle dropdown change
  const handleTeamChange = (event) => {
    const id = event.target.value;
    setSelectedTeamId(id);

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
    <React.Fragment>
      <div className="team-selector-container">
        <label htmlFor="team-select" className="team-selector-label">
          Select Team:
        </label>
        <select
          id="team-select"
          className="team-selector-dropdown"
          value={selectedTeamId}
          onChange={handleTeamChange}
        >
          <option value="" disabled>
            {"Choose a Team"}
          </option>

          {/* Map available teams to options */}
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
    </React.Fragment>
  );
};

export default TeamSelector;
