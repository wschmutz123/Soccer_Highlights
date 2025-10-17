# Soccer_Highlights Application

## App Setup

1. Navigate to the frontend folder:

```bash
cd frontend
npm install
npm start

```

### Files Overview

- **index.js** – Entry point that renders the React app into the DOM.
- **highlights/pages/SoccerHighlightsPage.js** – Main page that combines team selection, player list, and highlight player components.
- **highlights/components/TeamSelector.js** – Dropdown for selecting a team from all available teams.
- **highlights/context/TeamsContext.js** – Provides a React context to share team data across the app.
- **highlights/components/PlayerList.js** – Displays a list of players for a selected team and allows selecting a player.
- **highlights/components/HighlightPlayer.js** – Displays the currently selected highlight video and handles playback.
- **highlights/components/HighlightControlPanel.js** – UI controls for navigating and interacting with video highlights.
- **highlights/components/HighlightTimeline.js** – Shows a timeline of all highlights for a player.
