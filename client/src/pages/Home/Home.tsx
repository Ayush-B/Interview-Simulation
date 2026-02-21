import { useEffect, useState } from "react";
import { healthCheck } from "../../../services/api";

export default function Home() {
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    healthCheck()
      .then((data) => setResult(JSON.stringify(data)))
      .catch((err) => setResult(err?.message || "API error"));
  }, []);

  return (
    <div>
      <h1>Interview Simulation</h1>
      <p>API: {result}</p>
    </div>
  );
}