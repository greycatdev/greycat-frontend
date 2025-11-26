import { useEffect, useState } from "react";

export default function CarLoader() {
  const messages = [
    "loading the site",
    "fetching database",
    "collecting information",
    "securing connection",
  ];

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Change message every 1.8s
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(msgInterval);
  }, []);

  // Increase progress smoothly
  useEffect(() => {
    const progInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + Math.floor(Math.random() * 8) + 2; // +2 to +10 random
      });
    }, 300);

    return () => clearInterval(progInterval);
  }, []);

  return (
    <div className="loader-page">
      <div className="loader-text-main">LOADING ...</div>

      {/* Progress Bar */}
      <div className="loader-bar">
        <div
          className="loader-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Percentage */}
      <div className="loader-percent">{progress}%</div>

      {/* Changing Text */}
      <p className="loader-message">{messages[index]}...</p>
    </div>
  );
}
