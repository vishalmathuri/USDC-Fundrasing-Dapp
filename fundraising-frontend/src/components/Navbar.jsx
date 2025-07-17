import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#1f2937", // dark gray
        color: "#fff",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
        <h2>Fundraiser DApp</h2>
      </Link>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/create" style={linkStyle}>
          Create Campaign
        </Link>
      </div>
    </nav>
  );
};

const linkStyle = {
  textDecoration: "none",
  color: "#fff",
  fontWeight: "500",
  fontSize: "1rem",
  transition: "color 0.3s",
};

export default Navbar;
