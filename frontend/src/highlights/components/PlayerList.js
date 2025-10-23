import React, { useMemo, useEffect, useState, useRef } from "react";
import { useQuery, gql } from "@apollo/client";

import "./PlayerList.css"; // Dedicated CSS file for the list

export const GET_TEAM_MEMBERS = gql`
  query TeamMembers($teamHash: String!) {
    teamMembers(team_hash: $teamHash) {
      team_player_id # Unique Team Member ID
      is_player
      jersey_number
      user {
        user_id
        first_name
        last_name
      }
    }
  }
`;

/**
 * @param {object} props.team - The currently selected team object.
 * @param {function} props.onSelectPlayer - Callback function when a player is clicked.
 * @param {function} props.onPlayersLoaded - Callback function when players are loaded.
 * @param {object} props.selectedPlayer - The currently selected player object.
 */
const PlayerList = ({
  team,
  onSelectPlayer,
  onPlayersLoaded,
  selectedPlayer,
}) => {
  const teamHash = team?.id || "";
  const [isDisabled, setIsDisabled] = useState(false);
  const initializedRef = useRef(false);

  const { loading, error, data } = useQuery(GET_TEAM_MEMBERS, {
    variables: { teamHash },
    skip: !teamHash,
  });

  /**
   * Memoized computation of the team's player list.
   * Filters out non-players, maps relevant data, and sorts by jersey number and name.
   */
  const teamPlayers = useMemo(() => {
    const members = data?.teamMembers || [];
    return members
      .filter((m) => m.is_player)
      .map((m) => ({
        id: m.team_player_id,
        firstName: m.user?.first_name || "",
        lastName: m.user?.last_name || "",
        name: `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim(),
        number: m.jersey_number,
      }))
      .sort((a, b) => {
        // Sort by jersey number first, then name // Infinity
        const numA = Number(a.number) || 0;
        const numB = Number(b.number) || 0;
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
      });
  }, [data]);

  /**
   * Notify parent component that the players have been loaded.
   */
  useEffect(() => {
    if (!initializedRef.current && teamPlayers?.length && onPlayersLoaded) {
      onPlayersLoaded(teamPlayers);
      initializedRef.current = true;
    }
  }, [teamPlayers, onPlayersLoaded]);

  /**
   * Disables player buttons for 1 second and calls function to setPlayer
   */
  const handlePlayerClick = (player) => {
    if (isDisabled) return;
    setIsDisabled(true);

    onSelectPlayer(player);

    setTimeout(() => setIsDisabled(false), 1000);
  };

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
      <h3>Players</h3>
      <ul className="player-items-list">
        {teamPlayers.map((player) => {
          const initials = `${player.firstName[0] || ""}${
            player.lastName[0] || ""
          }`.toUpperCase();
          return (
            <li
              key={player.id}
              className={`player-list-item ${
                selectedPlayer?.id === player.id ? "active" : ""
              } ${isDisabled ? "disabled" : ""}`}
              onClick={() => handlePlayerClick(player)}
            >
              <div className="player-info-column">
                <div className="player-initials-circle">{initials}</div>
                <div className="player-name-row">
                  {player.number ? (
                    <div>
                      #{player.number} {player.name}
                    </div>
                  ) : (
                    <div>{player.name}</div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayerList;
