import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import Hls from "hls.js";

import "./HighlightPlayer.css";

const GET_PLAYER_HIGHLIGHTS = gql`
  query TeamPlayerMomentsInfo($teamPlayerId: Int!) {
    teamPlayerMomentsInfo(team_player_id: $teamPlayerId) {
      duration
      event
      game_id
      hls_url
      offset
    }
  }
`;

/**
 * HighlightPlayer Component (The Main Video Area)
 * @param {object} props - Component props
 * @param {object} props.player - The currently selected player object.
 */
const HighlightPlayer = ({ player }) => {
  const teamPlayerId = player?.id ? parseInt(player.id, 10) : null;
  const videoRef = useRef(null);
  const [highlights, setHighlights] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  const { loading, error, data, refetch } = useQuery(GET_PLAYER_HIGHLIGHTS, {
    variables: { teamPlayerId: teamPlayerId },
    skip: !teamPlayerId || isNaN(teamPlayerId),
  });

  useEffect(() => {
    if (data?.teamPlayerMomentsInfo?.length > 0) {
      const mapped = data.teamPlayerMomentsInfo.map((h) => ({
        videoUrl: h.hls_url,
        start: h.offset || 0,
        end: (h.offset || 0) + (h.duration || 0),
        event: h.event || "Unknown",
        gameId: h.game_id,
        duration: h.duration,
      }));
      setHighlights(mapped);
      setCurrentHighlightIndex(0); // start from first highlight
    } else {
      setHighlights([]);
    }
  }, [data]);

  const currentHighlight = highlights[currentHighlightIndex];

  useEffect(() => {
    const video = videoRef.current;
    let hlsInstance = null;

    if (!video || !currentHighlight) {
      if (video) video.src = "";
      return;
    }

    const videoUrl = currentHighlight.videoUrl;

    if (Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error(`[HLS Fatal Error] ${data.type}: ${data.details}`);
        }
      });

      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = currentHighlight.start;
        video.muted = true;
        video
          .play()
          .catch((err) =>
            console.warn("Autoplay blocked, waiting for user interaction.", err)
          );
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        video.currentTime = currentHighlight.start;
        video
          .play()
          .catch((err) => console.warn("Native playback blocked.", err));
      };
    } else {
      console.error("No HLS support found.");
      video.src = "";
    }

    return () => {
      if (hlsInstance) hlsInstance.destroy();
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [currentHighlight]);

  // 3. Handle when the video clip ends
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (
      video &&
      currentHighlight &&
      video.currentTime >= currentHighlight.end
    ) {
      playNextHighlight();
    }
  };

  // 4. Logic to advance to the next highlight
  const playNextHighlight = () => {
    const nextIndex = currentHighlightIndex + 1;
    if (nextIndex < highlights.length) {
      setCurrentHighlightIndex(nextIndex);
    } else {
      // Finished all highlights, loop back or just stop
      setCurrentHighlightIndex(0);
      videoRef.current.src = null;
    }
  };

  if (!player) {
    return (
      <div className="highlight-player-placeholder">
        Select a player to view highlights.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="highlight-player-loading">
        Loading highlights for {player.name}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="highlight-player-error">
        Error loading highlights: {error.message}
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div className="highlight-player-placeholder">
        No highlights available for {player.name}.
      </div>
    );
  }

  return (
    <div className="highlight-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="highlight-video-player"
          controls
          autoPlay
          onTimeUpdate={handleVideoTimeUpdate}
          // Use onTimeUpdate to precisely check the highlight's end time
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="highlight-details">
        <h2 className="player-name-display">{player.name}</h2>
        <p className="highlight-event">
          Current Event:
          <span className="event-name">
            {currentHighlight?.event || "Starting..."}
          </span>
        </p>
        <p className="highlight-counter">
          Highlight {currentHighlightIndex + 1} of {highlights.length}
        </p>
      </div>
    </div>
  );
};

export default HighlightPlayer;
