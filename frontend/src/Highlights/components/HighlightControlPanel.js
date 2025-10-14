import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
} from "lucide-react";

import "./HighlightControlPanel.css";

const HighlightControlPanel = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSkip,
}) => {
  return (
    <div className="custom-controls">
      <button onClick={onPrevious} title="Previous Highlight">
        <SkipBack size={20} />
      </button>
      <button onClick={() => onSkip(-5)} title="Rewind 5s">
        <Rewind size={20} />
      </button>
      <button onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
      </button>
      <button onClick={() => onSkip(5)} title="Forward 5s">
        <FastForward size={20} />
      </button>
      <button onClick={onNext} title="Next Highlight">
        <SkipForward size={20} />
      </button>
    </div>
  );
};

export default HighlightControlPanel;
