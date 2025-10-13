import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelector from "../components/TeamSelector";
import PlayerList from "../components/PlayerList";
import HighlightPlayer from "../components/HighlightPlayer";

function SoccerHighlightsPage() {
  const navigate = useNavigate();
  const { teamId, playerId } = useParams();

  const playerIdRef = useRef(playerId);

  // 2. State to hold the RESOLVED OBJECTS (derived from URL IDs)
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamsLoaded, setTeamsLoaded] = useState(false);

  const [players, setPlayers] = useState([]);

  // --- Handlers for clicks ---
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    navigate(`/${team.id}`);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    if (selectedTeam) {
      navigate(`/${selectedTeam.id}/${player.id}`);
    }
  };

  useEffect(() => {
    if (!selectedTeam || !playerIdRef) return;
    const player = players.find((p) => p.id === playerIdRef.current);
    if (player) setSelectedPlayer(player);
  }, [selectedTeam, players]);

  const handlePlayersLoaded = (loadedPlayers) => {
    setPlayers(loadedPlayers);
    if (playerIdRef.current) {
      const player = loadedPlayers.find(
        (p) => String(p.id) === String(playerIdRef.current)
      );
      if (player) handlePlayerSelect(player);
    }
  };

  return (
    <div className="highlights-page-layout">
      <header>
        {/* Pass current URL teamId down for initial selection */}
        <TeamSelector
          onSelectTeam={handleTeamSelect}
          initialTeamId={teamId} // Prop to help TeamSelector initialize
          onTeamsLoaded={() => setTeamsLoaded(true)}
        />
      </header>
      <main style={{ display: "flex" }}>
        <aside style={{ width: "30%" }}>
          {/* PlayerList needs the RESOLVED team OBJECT */}
          {selectedTeam && (
            <PlayerList
              team={selectedTeam}
              onSelectPlayer={handlePlayerSelect}
              onPlayersLoaded={handlePlayersLoaded}
              selectedPlayer={selectedPlayer}
            />
          )}
        </aside>
        <section style={{ flexGrow: 1 }}>
          {/* HighlightPlayer needs the RESOLVED player OBJECT */}
          {teamsLoaded && <HighlightPlayer player={selectedPlayer} />}
        </section>
      </main>
    </div>
  );
}

export default SoccerHighlightsPage;
