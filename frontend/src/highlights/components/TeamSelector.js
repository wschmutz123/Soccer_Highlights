import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../context/TeamsContext";
import Select from "react-select";

import "./TeamSelector.css";

/**
 * TeamSelector Component
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

  // Handle dropdown change
  const handleTeamChange = (id) => {
    setSelectedTeamId(id);

    if (!id) {
      // User selected "Choose a Team"
      onSelectTeam(null);
      return;
    }

    const teamObject = teams.find((t) => t.id === id);

    if (teamObject) {
      onSelectTeam(teamObject);
    }
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  if (isLoading || teams.length === 0) {
    return <div className="team-selector-loading">Loading teams...</div>;
  }

  if (!isLoading && teams.length === 0) {
    return <div className="team-selector-error">No teams available.</div>;
  }

  return (
    <div className="team-selector-container">
      <Select
        options={teamOptions}
        value={teamOptions.find((opt) => opt.value === selectedTeamId) || null}
        onChange={(selectedOption) => handleTeamChange(selectedOption?.value)}
        placeholder="Choose a Team"
        isClearable
        className="team-selector"
      />
    </div>
  );
};

export default TeamSelector;
