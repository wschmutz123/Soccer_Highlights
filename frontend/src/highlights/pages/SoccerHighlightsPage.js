import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelector from "../components/TeamSelector";
import PlayerList from "../components/PlayerList";
import HighlightPlayer from "../components/HighlightPlayer";
import { useTeams } from "../context/TeamsContext";

import "./SoccerHighlightsPage.css";

const SoccerHighlightsPage = () => {
  const navigate = useNavigate();
  const { teamId, playerId } = useParams();

  const playerIdRef = useRef(playerId);
  const initialPlayerSelectedRef = useRef(false);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { teams } = useTeams();

  /**
   * Handles selection of a team from the dropdown or list.
   * @param {object|null} team - The team object selected, or null if "Choose a Team" is clicked.
   */
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);

    if (!team) {
      setSelectedPlayer(null);
      navigate(`/`);
      return;
    }

    navigate(`/${team.id}`);
  };

  /**
   * Handles selection of a player from the player list.
   * @param {object} player - The player object that was clicked.
   */
  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    if (selectedTeam) {
      navigate(`/${selectedTeam.id}/${player.id}`);
    }
  };

  /**
   * Callback when players for a team have loaded.
   * Sets players in state and selects the player if playerIdRef is set.
   * @param {Array} loadedPlayers - Array of player objects for the selected team.
   */
  const handlePlayersLoaded = (loadedPlayers) => {
    if (!initialPlayerSelectedRef.current && playerIdRef.current) {
      const player = loadedPlayers.find(
        (p) => String(p.id) === String(playerIdRef.current)
      );
      if (player) {
        handlePlayerSelect(player);
        initialPlayerSelectedRef.current = true; // mark as done
      }
    }
  };

  return (
    <div className="highlights-page-layout">
      <header>
        <TeamSelector onSelectTeam={handleTeamSelect} initialTeamId={teamId} />
      </header>
      <main className="main-layout">
        <aside className="sidebar">
          {selectedTeam && (
            <PlayerList
              team={selectedTeam}
              onSelectPlayer={handlePlayerSelect}
              onPlayersLoaded={handlePlayersLoaded}
              selectedPlayer={selectedPlayer}
            />
          )}
        </aside>
        <section className="main-content">
          {teams && <HighlightPlayer player={selectedPlayer} />}
        </section>
      </main>
    </div>
  );
};

export default SoccerHighlightsPage;
