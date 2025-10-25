import React from "react";
import { useTeams } from "../context/TeamsContext";
import Select from "react-select";

import "./TeamSelector.css";

/**
 * TeamSelector Component
 * @param {function} props.onSelectTeam - Callback function when a team is selected
 * @param {string} props.initialTeamId - The teamId in the url
 */
const TeamSelector = ({ selectedTeam, setSelectedTeam }) => {
  const { teams, isLoading } = useTeams();

  // Handle dropdown change
  const handleTeamChange = (id) => {
    if (!id) {
      // User selected "Choose a Team"
      setSelectedTeam(null);
      return;
    }

    const teamObject = teams.find((t) => t.id === id);

    if (teamObject) {
      setSelectedTeam(teamObject);
    }
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  if (isLoading) {
    return <div className="team-selector-loading">Loading teams...</div>;
  }

  if (!isLoading && teams.length === 0) {
    return <div className="team-selector-error">No teams available.</div>;
  }

  return (
    <div className="team-selector-container">
      <Select
        options={teamOptions}
        value={
          selectedTeam
            ? teamOptions.find((opt) => opt.value === selectedTeam.id)
            : null
        }
        onChange={(selectedOption) => handleTeamChange(selectedOption?.value)}
        placeholder="Choose a Team"
        isClearable
        className="team-selector"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "12px",
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "12px",
          }),
        }}
      />
    </div>
  );
};

export default TeamSelector;
