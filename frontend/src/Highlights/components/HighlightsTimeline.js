import React from "react";
import "./HighlightsTimeline.css";

const HighlightsTimeline = ({
  highlights,
  currentHighlightIndex,
  onSelectHighlight,
}) => {
  return (
    <div className="highlights-timeline">
      {highlights.map((h, index) => (
        <button
          key={index}
          className={`highlight-button ${
            index === currentHighlightIndex ? "active" : ""
          }`}
          onClick={() => onSelectHighlight(index)}
        >
          {h.event}
        </button>
      ))}
    </div>
  );
};

export default HighlightsTimeline;
