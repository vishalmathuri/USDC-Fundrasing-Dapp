import React from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const CampaignCard = ({ campaign }) => {
  const {
    id,
    creator,
    title,
    description,
    goal,
    minDonation,
    deadline,
    totalDonated,
  } = campaign;

  const progress = Math.min((totalDonated / goal) * 100, 100).toFixed(2);
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleString();

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "10px",
      padding: "1rem",
      width: "300px"
    }}>
      <h3>{title}</h3>
      <p><strong>Creator:</strong> {creator.slice(0, 6)}...{creator.slice(-4)}</p>
      <p><strong>Description:</strong> {description}</p>
      <p><strong>Goal:</strong> {ethers.utils.formatUnits(goal, 18)} USDC</p>
      <p><strong>Min Donation:</strong> {ethers.utils.formatUnits(minDonation, 18)} USDC</p>
      <p><strong>Raised:</strong> {ethers.utils.formatUnits(totalDonated, 18)} USDC</p>
      <p><strong>Deadline:</strong> {deadlineDate}</p>
      <div style={{ background: "#eee", height: "10px", borderRadius: "5px", margin: "10px 0" }}>
        <div
          style={{
            width: `${progress}%`,
            background: "#4caf50",
            height: "100%",
            borderRadius: "5px",
          }}
        ></div>
      </div>
      <Link to={`/donate/${id}`}>
        <button>Donate</button>
      </Link>
    </div>
  );
};

export default CampaignCard;
