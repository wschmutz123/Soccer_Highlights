import React, { useState } from "react";
import "./HighlightTimeline.css";

/**
 * Displays a horizontal scrollable list of video highlights as buttons.
 * Allows the user to click on a highlight to select it.
 *
 * @param {Object[]} highlights - Array of highlight objects with `event` and timing info
 * @param {number} currentHighlightIndex - Index of the currently selected highlight
 * @param {function} onSelectHighlight - Callback fired when a highlight is clicked
 */
const HighlightTimeline = ({
  highlights,
  currentHighlightIndex,
  onSelectHighlight,
}) => {
  const [disabled, setDisabled] = useState(false);
  // const timeoutRef = useRef(null);

  const handleClick = (index) => {
    setDisabled(true);
    onSelectHighlight(index);
    // timeoutRef.current =
    setTimeout(() => {
      setDisabled(false);
      // timeoutRef.current = null;
    }, 1000);
  };

  /*
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  */

  return (
    <div className="highlights-timeline">
      {highlights.map((h, index) => (
        <button
          key={index}
          className={`highlight-button ${
            index === currentHighlightIndex ? "active" : ""
          }`}
          onClick={() => handleClick(index)}
          disabled={disabled}
        >
          {h.event} ({h.duration.toFixed(2)}s)
        </button>
      ))}
    </div>
  );
};

export default HighlightTimeline;
