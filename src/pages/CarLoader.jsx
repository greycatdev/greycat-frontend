import { useEffect, useState } from "react";

export default function CarLoader() {
  const messages = [
    "loading the site",
    "fetching database",
    "collecting information",
    "securing connection",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <div className="car">
        🚗
      </div>

      <p className="loader-text">{messages[index]}...</p>
    </div>
  );
}
