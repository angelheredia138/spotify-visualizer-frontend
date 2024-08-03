import React from "react";
import Confetti from "react-dom-confetti";

const ControlledConfetti = ({ run }) => {
  const config = {
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: 15,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 0,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#FFC700", "#FF0000", "#00FF00", "#0000FF", "#FF00FF"],
  };

  return <Confetti active={run} config={config} />;
};

export default ControlledConfetti;
