import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../context/TeamsContext";

import "./TeamSelector.css";

/**
 * TeamSelector Component
 * @param {object} props - Component props
 * @param {function} props.onSelectTeam - Callback function when a team is selected
 * @param {string} props.initialTeamId - The teamId in the url
 */
const TeamSelector = ({ onSelectTeam, initialTeamId }) => {
  const navigate = useNavigate();

  const { teams, isLoading } = useTeams();

  const [selectedTeamId, setSelectedTeamId] = useState("");

  const initialized = useRef(false);

  const safeNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

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
      safeNavigate("/");
    }

    initialized.current = true;
  }, [teams, initialTeamId, onSelectTeam, safeNavigate]);

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
