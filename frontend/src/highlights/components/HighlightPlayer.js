import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import HighlightTimeline from "./HighlightTimeline";
import HighlightControlPanel from "./HighlightControlPanel";
import Hls from "hls.js";

import "./HighlightPlayer.css";

export const GET_PLAYER_HIGHLIGHTS = gql`
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

const HighlightPlayer = ({ player }) => {
  const teamPlayerId = player?.id ? parseInt(player.id, 10) : null;
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [highlights, setHighlights] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const { loading, error, data } = useQuery(GET_PLAYER_HIGHLIGHTS, {
    variables: { teamPlayerId },
    skip: !teamPlayerId || isNaN(teamPlayerId),
  });

  // Map highlights data
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
      setCurrentHighlightIndex(0);
    } else {
      setHighlights([]);
    }
  }, [data]);

  const currentHighlight = highlights[currentHighlightIndex];

  // Load and play HLS video
  useEffect(() => {
    if (!currentHighlight?.videoUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const playHighlight = async () => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;

        hls.attachMedia(video);
        hls.loadSource(currentHighlight.videoUrl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.currentTime = currentHighlight.start;
          setIsPlaying(true);
          video.play().catch(() => setVideoError(true));
        });
      }
    };

    playHighlight();
  }, [currentHighlight]);

  /**
   * Handles progression of currently playing highlight video
   */
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !currentHighlight) return;

    if (video.currentTime >= currentHighlight.end) {
      if (currentHighlightIndex < highlights.length - 1) {
        setCurrentHighlightIndex(currentHighlightIndex + 1);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  /**
   * Advances playback to the next highlight in the list.
   * If currently at the last highlight, pauses the video and stops playback.
   */
  const playNextHighlight = () => {
    const nextIndex = currentHighlightIndex + 1;
    if (nextIndex < highlights.length) {
      setCurrentHighlightIndex(nextIndex);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      videoRef.current?.pause();
    }
  };

  // Set playback to the previous highlight in the list.
  const playPreviousHighlight = () => {
    const prevIndex = currentHighlightIndex - 1;
    if (prevIndex >= 0) {
      setCurrentHighlightIndex(prevIndex);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      videoRef.current?.pause();
    }
  };

  // Handles moving `seconds` in the video
  const skipTime = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(
        currentHighlight.start,
        Math.min(video.currentTime + seconds, currentHighlight.end)
      );
    }
  };

  // Handles Play and Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!player)
    return (
      <div className="highlight-player-placeholder">
        Choose a Team and Player to get Highlights
      </div>
    );
  if (loading)
    return (
      <div className="highlight-player-loading">
        Loading highlights for {player.name}...
      </div>
    );
  if (error || highlights.length === 0)
    return (
      <div className="highlight-player-placeholder">
        No highlights available for {player.name}.
      </div>
    );

  return (
    <div className="highlight-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="highlight-video-player"
          muted
          controls={false}
          onTimeUpdate={handleVideoTimeUpdate}
          style={{ width: "100%", height: "100%" }}
        />

        <div className="player-overlay">
          <div className="highlight-player-initials-circle">
            {player.firstName?.[0]?.toUpperCase()}
            {player.lastName?.[0]?.toUpperCase()}
          </div>
          <div className="highlight-player-name-row">
            {player.number && <div>#{player.number}</div>}
            <div>{player.name}</div>
          </div>
          <div className="highlight-event">{currentHighlight.event}</div>
        </div>

        <HighlightControlPanel
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={playNextHighlight}
          onPrevious={playPreviousHighlight}
          onSkip={skipTime}
        />
      </div>

      <HighlightTimeline
        highlights={highlights}
        currentHighlightIndex={currentHighlightIndex}
        onSelectHighlight={(index) => setCurrentHighlightIndex(index)}
      />
      <div>
        {videoError && (
          <div className="overlay">
            ⚠️ Couldn't load video
            <button
              className="video-error-close"
              onClick={() => setVideoError(false)}
            >
              ✖
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightPlayer;
