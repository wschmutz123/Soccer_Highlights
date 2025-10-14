import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./TeamSelector.css";

const API_URL = "https://lapi.traceup.com/upload-dev/data/db-ro/query";

/**
 * TeamSelector Component
 * @param {object} props - Component props
 * @param {function} props.onSelectTeam - Callback function when a team is selected
 */
const TeamSelector = ({ onSelectTeam, initialTeamId, onTeamsLoaded }) => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const initialized = useRef(false);

  /**
   * Fetches the list of teams from the API, standardizes their format,
   * sorts them alphabetically, updates state, and notifies the parent
   * when teams have loaded.
   */
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: [
              {
                type: "query",
                table: "test_top_teams",
                data: {},
              },
            ],
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        const fetchedTeams = data?.result?.[0]?.data?.data || [];
        const standardizedTeams = fetchedTeams
          .map((team) => ({
            id: team.team_hash,
            name: team.title.trim(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (onTeamsLoaded) onTeamsLoaded();
        setTeams(standardizedTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [onTeamsLoaded]);

  /**
   * Initializes the selected team when teams are loaded.
   * If an initialTeamId is provided, selects that team and notifies the parent.
   * Ensures this initialization runs only once using a ref.
   */
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
      setSelectedTeamId(""); // shows "Choose a Team"
      navigate("/");
    }

    initialized.current = true;
  }, [teams, initialTeamId, onSelectTeam, navigate]);

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
