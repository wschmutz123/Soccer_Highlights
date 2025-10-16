import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import HighlightTimeline from "./HighlightTimeline";
import HighlightControlPanel from "./HighlightControlPanel";
import HlsPlayer from "react-hls-player";

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
 * @param {object} props.player - The currently selected player object.
 */
const HighlightPlayer = ({ player }) => {
  const teamPlayerId = player?.id ? parseInt(player.id, 10) : null;

  const videoRef = useRef(null);

  const [highlights, setHighlights] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [highlightLoaded, setHighlightLoaded] = useState(false);
  const [isLoadingHighlight, setIsLoadingHighlight] = useState(false);

  const { loading, error, data } = useQuery(GET_PLAYER_HIGHLIGHTS, {
    variables: { teamPlayerId: teamPlayerId },
    skip: !teamPlayerId || isNaN(teamPlayerId),
  });

  /**
   * Updates the highlights state whenever new player highlight data arrives.
   * Maps the raw `teamPlayerMomentsInfo` data to a structured format
   * Resets the current highlight index to 0 to start playback from the first highlight.
   * If no highlight data exists, clears the highlights array.
   */
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

  /**
   * Automatically plays the current highlight whenever it changes.
   * - Checks that the video URL is valid before attempting playback.
   * - Finds the highlight's start time, plays video, and handles errors
   */
  useEffect(() => {
    const playHighlight = async () => {
      if (!currentHighlight?.videoUrl) return;

      setIsLoadingHighlight(true);

      try {
        // Check URL first
        const res = await fetch(currentHighlight.videoUrl, { method: "HEAD" });
        if (!res.ok) throw new Error("Video not found");

        setVideoError(false);

        if (!highlightLoaded && videoRef.current && currentHighlight) {
          videoRef.current.currentTime = currentHighlight.start;
          setHighlightLoaded(true);
          if (isPlaying)
            videoRef.current.play().catch(() => setVideoError(true));
        }

        const video = videoRef.current;
        if (video && !highlightLoaded) {
          video.currentTime = currentHighlight.start;
          if (isPlaying) await video.play();
          setHighlightLoaded(true);
        }
      } catch {
        setVideoError(true);
        setHighlightLoaded(false);
      } finally {
        setIsLoadingHighlight(false);
      }
    };

    playHighlight();
  }, [currentHighlight, isPlaying]);

  /**
   * Resets the highlightLoaded flag whenever a new highlight
   * is selected, so the first effect knows to jump to start.
   */
  useEffect(() => {
    setHighlightLoaded(false);
    setIsPlaying(true); // autoplay new highlight
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
        video.currentTime = currentHighlight.end;
        setIsPlaying(false);
      }
    }
  };

  /**
   * Advances playback to the next highlight in the list.
   * If currently at the last highlight, pauses the video and stops playback .
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

  if (!player) {
    return (
      <div className="highlight-player-placeholder">
        Choose a Team and Player to get Highlights
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
      <div className="highlight-player-placeholder">
        No highlights available for {player.name}.
      </div>
    );
  }

  if (!loading && highlights.length === 0) {
    return (
      <div className="highlight-player-placeholder">
        No highlights available for {player.name}.
      </div>
    );
  }

  return (
    <div className="highlight-player-container">
      <div className="video-wrapper">
        {isLoadingHighlight && (
          <div className="overlay">
            <div className="spinner" />
          </div>
        )}
        <HlsPlayer
          className="highlight-video-player"
          playerRef={videoRef}
          src={currentHighlight.videoUrl}
          controls={false}
          muted={true}
          onLoadedMetadata={() => {
            if (!highlightLoaded && videoRef.current && currentHighlight) {
              videoRef.current.currentTime = currentHighlight.start;
              setHighlightLoaded(true);
              if (isPlaying)
                videoRef.current.play().catch(() => setVideoError(true));
            }
          }}
          onError={() => {
            setVideoError(true);
          }}
          onTimeUpdate={handleVideoTimeUpdate}
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
        onSelectHighlight={(index) => {
          setCurrentHighlightIndex(index);
          setHighlightLoaded(false);
          const video = videoRef.current;
          if (video) {
            setIsPlaying(true);
          }
        }}
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
