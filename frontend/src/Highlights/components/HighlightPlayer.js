import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import Hls from "hls.js";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
} from "lucide-react";
import HighlightsTimeline from "./HighlightsTimeline";

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
  const hlsRef = useRef(null);
  const currentVideoUrlRef = useRef("");

  const [highlights, setHighlights] = useState([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const { loading, error, data } = useQuery(GET_PLAYER_HIGHLIGHTS, {
    variables: { teamPlayerId: teamPlayerId },
    skip: !teamPlayerId || isNaN(teamPlayerId),
  });

  /**
   * Updates the highlights state whenever new player highlight data arrives.
   * Maps the raw `teamPlayerMomentsInfo` data to a structured format
   * Resets the current highlight index to 0 to start playback from the first highlight.
   * If no highlight data exists, clears the highlights array.
   * Dependencies:
   * Runs whenever the data in graphQL query changes
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
   * Handles video playback for the current highlight
   * Resonsibilities:
   * Loads the video if it hasn't been loaded yet
   * Attach the video to the HLS instance, sets the video's start time, mutes the video, and autoplays it
   * If same video already loaded, simply jump to the new highlight start time
   * Cleanup on highlight or player change by destroying HLS instance, pausing video, resetting video element
   * Dependencies:
   * Current Highlight: The highlight currently selected for playback
   * Player: Selected player, reload video when switching players
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentHighlight) return;

    const videoUrl = currentHighlight.videoUrl;

    setVideoError(false);

    const handleVideoError = () => setVideoError(true);
    video.addEventListener("error", handleVideoError);

    if (!hlsRef.current || currentVideoUrlRef.current !== videoUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls();
      hlsRef.current = hls;
      currentVideoUrlRef.current = videoUrl;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      // Need to wait for the manifest to be parsed
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = currentHighlight.start || 0;
        video.muted = true;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setVideoError(true);
      });
    } else {
      video.currentTime = currentHighlight.start || 0;
      video.play().catch(() => setVideoError(true));
      setIsPlaying(true);
    }

    // Cleanup when component unmounts
    return () => {
      video.removeEventListener("error", handleVideoError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
        currentVideoUrlRef.current = "";
      }

      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [currentHighlight, player]);

  /**
   * Handles progression of currently playing highlight video
   * Check if video has passed the end time of current highlight
   * If it has checks if it's the last highlight it pauses the video
   * Otherwise:  Advances to next highlight
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
    }
  };

  // Moves `seconds` in the video
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
          controls={false}
          onTimeUpdate={handleVideoTimeUpdate}
        >
          Your browser does not support the video tag.
        </video>

        {/* Overlay for player info */}
        <div className="player-overlay">
          <div className="highlight-player-initials-circle">
            {player.firstName?.[0]?.toUpperCase()}
            {player.lastName?.[0]?.toUpperCase()}
          </div>
          <div className="highlight-player-name-row">
            {player.number && (
              <div className="highlight-player-number">#{player.number}</div>
            )}
            <div className="highlight-player-name">{player.name}</div>
          </div>
          <div className="highlight-event">
            {currentHighlight.event || "Starting..."}
          </div>
        </div>
        <div className="custom-controls">
          <button onClick={playPreviousHighlight} title="Previous Highlight">
            <SkipBack size={20} />
          </button>
          <button onClick={() => skipTime(-5)} title="Rewind 5s">
            <Rewind size={20} />
          </button>
          <button
            onClick={togglePlayPause}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button onClick={() => skipTime(5)} title="Forward 5s">
            <FastForward size={20} />
          </button>
          <button onClick={playNextHighlight} title="Next Highlight">
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <HighlightsTimeline
        highlights={highlights}
        currentHighlightIndex={currentHighlightIndex}
        onSelectHighlight={(index) => setCurrentHighlightIndex(index)}
      />
      <div>
        {videoError && (
          <div className="video-error-overlay">
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
