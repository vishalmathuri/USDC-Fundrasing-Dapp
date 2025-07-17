import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.campaignCount();
      const total = Number(count);

      const campaignPromises = Array.from({ length: total }).map((_, i) =>
        contract.getCampaign(i)
      );

      const rawCampaigns = await Promise.all(campaignPromises);

      const formatted = rawCampaigns.map((c, index) => ({
        id: index,
        name: c.name,
        description: c.description,
        goal: ethers.utils.formatUnits(c.goal, 6),
        raised: ethers.utils.formatUnits(c.totalCollected, 6),
        deadline: new Date(Number(c.deadline) * 1000).toLocaleString(),
        image: c.image,
      }));

      setCampaigns(formatted);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      alert('❌ Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📢 All Campaigns</h2>

      {loading ? (
        <p>Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        campaigns.map((c) => (
          <div key={c.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            {c.image && (
              <img
                src={c.image.startsWith('http') ? c.image : `https://ipfs.io/ipfs/${c.image}`}
                alt={c.name}
                style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '1rem' }}
              />
            )}
            <h3>{c.name}</h3>
            <p>{c.description}</p>
            <p>🎯 Goal: {c.goal} USDC</p>
            <p>💰 Raised: {c.raised} USDC</p>
            <p>⏰ Deadline: {c.deadline}</p>
            <Link to={`/campaign/${c.id}`}>
              <button style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>View Details</button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
