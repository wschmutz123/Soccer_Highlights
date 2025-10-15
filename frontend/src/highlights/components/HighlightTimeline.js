import React from "react";
import "./HighlightTimeline.css";

/**
 * Displays a horizontal scrollable list of video highlights as buttons.
 * Allows the user to click on a highlight to select it.
 *
 * @param {Object[]} highlights - Array of highlight objects with `event` and timing info
 * @param {number} currentHighlightIndex - Index of the currently selected highlight
 * @param {function} onSelectHighlight - Callback fired when a highlight is clicked, receives the highlight index
 */
const HighlightTimeline = ({
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

export default HighlightTimeline;
