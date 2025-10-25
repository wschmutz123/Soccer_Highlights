import { useState, useEffect } from "react";

const API_URL = "https://lapi.traceup.com/upload-dev/data/db-ro/query";

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: [{ type: "query", table: "test_top_teams", data: {} }],
          }),
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        const fetched = data?.result?.[0]?.data?.data || [];
        const standardized = fetched.map((t) => ({
          id: t.team_hash,
          name: t.title.trim(),
        }));

        setTeams(standardized);
        localStorage.setItem("teams", JSON.stringify(standardized));
      } catch (err) {
        console.log(err);
        console.error("Error fetching teams:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // setInterval to re-run teams every 5 minutes

    const savedTeams = localStorage.getItem("teams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
      setIsLoading(false);
    } else {
      fetchTeams();
    }
  }, []);

  return { teams, isLoading };
};
