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
   * Updates the selected team and player, then navigates to the appropriate route.
   * - Navigates to `/` if no team is selected.
   * - Navigates to `/{teamId}` if only a team is selected.
   * - Navigates to `/{teamId}/{playerId}` if both are selected.
   * @param {object|null} [team=selectedTeam] - The selected team object, or null to reset.
   * @param {object|null} [player=selectedPlayer] - The selected player object, or null if none.
   */
  const updateSelection = (team = selectedTeam, player = selectedPlayer) => {
    setSelectedTeam(team);
    setSelectedPlayer(player);

    if (!team) {
      navigate(`/`);
      return;
    }

    if (!player) {
      navigate(`/${team.id}`);
      return;
    }

    navigate(`/${team.id}/${player.id}`);
  };

  const handleTeamSelect = (team) => updateSelection(team, null);
  const handlePlayerSelect = (player) => updateSelection(selectedTeam, player);

  /**
   * Callback when players for a team have loaded.
   * Selects the player if playerIdRef is set.
   * @param {Array} loadedPlayers - Array of player objects for the selected team.
   */
  const handlePlayersLoaded = (loadedPlayers) => {
    if (!initialPlayerSelectedRef.current && playerIdRef.current) {
      const player = loadedPlayers.find(
        (p) => String(p.id) === String(playerIdRef.current)
      );
      if (player) {
        handlePlayerSelect(player);
        initialPlayerSelectedRef.current = true;
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
