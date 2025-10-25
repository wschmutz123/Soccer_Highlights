import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelector from "../components/TeamSelector";
import PlayerList from "../components/PlayerList";
import HighlightPlayer from "../components/HighlightPlayer";
import { useTeams } from "../context/TeamsContext";

import "./SoccerHighlightsPage.css";

const SoccerHighlightsPage = () => {
  const navigate = useNavigate();
  const { teamId, playerId } = useParams();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { teams } = useTeams();

  const safeNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  /**
   * Updates the selected team and player, then navigates to the appropriate route.
   * - Navigates to `/` if no team is selected.
   * - Navigates to `/{teamId}` if only a team is selected.
   * - Navigates to `/{teamId}/{playerId}` if both are selected.
   * @param {object|null} [team=selectedTeam] - The selected team object, or null to reset.
   * @param {object|null} [player=selectedPlayer] - The selected player object, or null if none.
   * @param {bool} [firstPass] - Check for if teamId should be rendered on firstPass
   */
  const updateSelection = useCallback(
    (team, player, firstPass = false) => {
      setSelectedTeam(team);
      setSelectedPlayer(player);

      if (!team) {
        safeNavigate("/");
        return;
      }

      if (!player) {
        if (!firstPass) {
          safeNavigate(`/${team.id}`);
        }
        return;
      }

      safeNavigate(`/${team.id}/${player.id}`);
    },
    [safeNavigate]
  );

  const handleTeamSelect = useCallback(
    (team, firstPass = false) => updateSelection(team, null, firstPass),
    [updateSelection]
  );
  const handlePlayerSelect = useCallback(
    (player) => updateSelection(selectedTeam, player),
    [selectedTeam, updateSelection]
  );

  useEffect(() => {
    if (teams.length === 0) return;
    let initialTeam = null;
    if (teamId) {
      initialTeam = teams.find((t) => t.id === teamId);
    }

    if (initialTeam) {
      handleTeamSelect(initialTeam, true);
    } else {
      handleTeamSelect(null, false);
    }
  }, [teams, handleTeamSelect, teamId]);

  /**
   * Callback when players for a team have loaded.
   * Selects the player if playerIdRef is set.
   * @param {Array} loadedPlayers - Array of player objects for the selected team.
   */
  const handlePlayersLoaded = useCallback(
    (loadedPlayers) => {
      if (playerId) {
        const player = loadedPlayers.find(
          (p) => String(p.id) === String(playerId)
        );

        if (player) {
          handlePlayerSelect(player);
        } else {
          safeNavigate(`/${selectedTeam.id}`);
        }
      }
    },
    [handlePlayerSelect, playerId, safeNavigate, selectedTeam]
  );

  return (
    <div className="highlights-page-layout">
      <header>
        <TeamSelector
          selectedTeam={selectedTeam}
          setSelectedTeam={handleTeamSelect}
        />
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
          <HighlightPlayer player={selectedPlayer} />
        </section>
      </main>
    </div>
  );
};

export default SoccerHighlightsPage;
