// src/context/TeamsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = "https://lapi.traceup.com/upload-dev/data/db-ro/query";

const TeamsContext = createContext();

/**
 * Custom hook to access the Teams context
 * @returns {Object} - Contains teams array, and isLoading boolean
 */
export const useTeams = () => useContext(TeamsContext);

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches the list of teams from the API, standardizes their format,
   * sorts them alphabetically
   */
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: [{ type: "query", table: "test_top_teams", data: {} }],
        }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      const fetchedTeams = data?.result?.[0]?.data?.data || [];
      const standardizedTeams = fetchedTeams
        .map((t) => ({ id: t.team_hash, name: t.title.trim() }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setTeams(standardizedTeams);
      localStorage.setItem("teams", JSON.stringify(standardizedTeams)); // persist
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      fetchTeams();
    }
  }, []);

  return (
    <TeamsContext.Provider value={{ teams, isLoading }}>
      {children}
    </TeamsContext.Provider>
  );
};
