import React, { useMemo, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";

import "./PlayerList.css"; // Dedicated CSS file for the list

const GET_TEAM_MEMBERS = gql`
  query TeamMembers($teamHash: String!) {
    teamMembers(team_hash: $teamHash) {
      team_player_id # Use this for the unique Team Member ID
      is_player # To ensure the member is a player, not a coach
      jersey_number # Use this field for the number
      # The player's name and user ID are nested within the 'user' object
      user {
        user_id # Use this for the Player's User ID (if needed)
        first_name
        last_name
      }
    }
  }
`;

/**
 * PlayerList Component (The Left Side Panel)
 * @param {object} props - Component props
 * @param {object} props.team - The currently selected team object from the parent.
 * @param {function} props.onSelectPlayer - Callback function when a player is clicked.
 */
const PlayerList = ({ team, onSelectPlayer, initialPlayerId }) => {
  const teamHash = team?.id || "";

  // Apollo useQuery hook handles data fetching and state
  const { loading, error, data } = useQuery(GET_TEAM_MEMBERS, {
    variables: { teamHash },
    // Skip the query if no valid teamHash is present
    skip: !teamHash,
  });

  const teamPlayers = useMemo(() => {
    const members = data?.teamMembers || [];
    return members
      .filter((m) => m.is_player)
      .map((m) => ({
        id: m.team_player_id,
        name: `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim(),
        number: m.jersey_number,
        raw: m,
      }));
  }, [data]);

  useEffect(() => {
    // Only run this when we have initialPlayerId and the players list is loaded
    if (initialPlayerId && teamPlayers.length > 0) {
      const playerFromUrl = teamPlayers.find((p) => p.id === initialPlayerId);

      // If a player is found, trigger the parent's handler
      if (playerFromUrl) {
        // We use a slight delay or next tick to ensure the parent's state
        // updates correctly if this runs right after the parent renders.
        // It's crucial for syncing the parent state for deep-links/refresh.
        onSelectPlayer(playerFromUrl);
      }
    }
    // Dependency: Rerun if URL ID changes OR if the list of players changes
  }, [initialPlayerId, teamPlayers, onSelectPlayer]);

  if (!teamHash) {
    return <div className="player-list-info">Please select a team.</div>;
  }

  if (loading) {
    return (
      <div className="player-list-loading">
        Loading players for {team.name}...
      </div>
    );
  }

  if (error) {
    // Display user-friendly error
    return (
      <div className="player-list-error">
        Error loading players: {error.message}
      </div>
    );
  }

  if (teamPlayers.length === 0) {
    return (
      <div className="player-list-info">No players found for {team.name}.</div>
    );
  }

  return (
    <div className="player-list-container">
      <h3 className="player-list-title">{team.name} Roster</h3>
      <ul className="player-items-list">
        {teamPlayers.map((player) => (
          <li
            key={player.id}
            className={`player-list-item ${
              String(initialPlayerId) === String(player.id) ? "active" : ""
            }`}
            onClick={() => onSelectPlayer(player)}
          >
            <span className="player-number">{player.number || "N/A"}</span>
            <span className="player-name">{player.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
