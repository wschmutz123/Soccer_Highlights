import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSelector from "../components/TeamSelector";
import PlayerList from "../components/PlayerList";
import HighlightPlayer from "../components/HighlightPlayer";

function SoccerHighlightsPage() {
  const navigate = useNavigate();
  const { teamId, playerId } = useParams();

  // 2. State to hold the RESOLVED OBJECTS (derived from URL IDs)
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    // If teamId changes, clear previous player selection
    setSelectedPlayer(null);
  }, [teamId]);

  // --- Handlers for clicks ---
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    navigate(`/${team.id}`);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    const team = selectedTeam; // already selected team object
    if (team) {
      navigate(`/${team.id}/${player.id}`);
    }
  };

  return (
    <div className="highlights-page-layout">
      <header>
        {/* Pass current URL teamId down for initial selection */}
        <TeamSelector
          onSelectTeam={handleTeamSelect}
          initialTeamId={teamId} // Prop to help TeamSelector initialize
        />
      </header>
      <main style={{ display: "flex" }}>
        <aside style={{ width: "30%" }}>
          {/* PlayerList needs the RESOLVED team OBJECT */}
          {selectedTeam && (
            <PlayerList
              team={selectedTeam}
              onSelectPlayer={handlePlayerSelect}
              initialPlayerId={playerId} // Prop to help PlayerList initialize
            />
          )}
        </aside>
        <section style={{ flexGrow: 1 }}>
          {/* HighlightPlayer needs the RESOLVED player OBJECT */}
          {selectedPlayer && <HighlightPlayer player={selectedPlayer} />}
        </section>
      </main>
    </div>
  );
}

export default SoccerHighlightsPage;
