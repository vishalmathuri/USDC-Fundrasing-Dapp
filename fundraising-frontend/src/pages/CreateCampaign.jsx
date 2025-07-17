import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config';
import { connectWallet } from '../utils/wallet';

const CreateCampaign = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    goal: '',
    minDonation: '',
    duration: '',
    beneficiary: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, description, goal, minDonation, duration, beneficiary, image } = form;

    if (!name || !description || !goal || !minDonation || !duration || !beneficiary) {
      return alert('⚠️ Please fill in all fields.');
    }

    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const campaignRequest = {
        name,
        description,
        goal: ethers.utils.parseUnits(goal, 6),
        minDonation: ethers.utils.parseUnits(minDonation, 6),
        duration: parseInt(duration), // in seconds
        beneficiary,
        image,
      };

      const tx = await contract.createCampaign(campaignRequest);
      await tx.wait();

      alert('✅ Campaign created successfully!');
      setForm({
        name: '',
        description: '',
        goal: '',
        minDonation: '',
        duration: '',
        beneficiary: '',
        image: '',
      });
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      alert('❌ Failed to create campaign. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>🚀 Create New Campaign</h2>

      {['name', 'description', 'goal', 'minDonation', 'duration', 'beneficiary', 'image'].map((field) => (
        <div key={field} style={{ marginBottom: '1rem' }}>
          <input
            type={field === 'goal' || field === 'minDonation' || field === 'duration' ? 'number' : 'text'}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={
              field === 'goal'
                ? 'Goal in USDC'
                : field === 'minDonation'
                ? 'Min donation in USDC'
                : field === 'duration'
                ? 'Duration in seconds (e.g. 604800 for 7 days)'
                : field === 'image'
                ? 'IPFS image CID or URL'
                : `Enter ${field}`
            }
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Creating...' : 'Create Campaign'}
      </button>
    </div>
  );
};

export default CreateCampaign;
