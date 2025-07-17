import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import CreateCampaign from "./pages/CreateCampaign";
import DonatePage from "./pages/DonatePage";
import CampaignDetail from "./pages/CampaignDetail"; // if this is implemented

function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ padding: "1rem 2rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/donate/:id" element={<DonatePage />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
