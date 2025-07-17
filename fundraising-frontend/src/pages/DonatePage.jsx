import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  USDC_ADDRESS,
  USDC_ABI,
} from '../config';
import { connectWallet } from '../utils/wallet';

const DonatePage = ({ campaignId }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return alert('Please enter a valid donation amount.');
    }

    try {
      setLoading(true);

      const { signer } = await connectWallet();
      const fundraising = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const campaign = await fundraising.getCampaign(campaignId); // ✅ fixed

      const now = Math.floor(Date.now() / 1000);
      if (now > Number(campaign.deadline)) {
        return alert("⛔ Campaign has ended.");
      }

      const parsedAmount = ethers.utils.parseUnits(amount, 6);
      if (parsedAmount.lt(campaign.minDonation)) {
        return alert(`⛔ Minimum donation is ${ethers.utils.formatUnits(campaign.minDonation, 6)} USDC`);
      }

      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const approveTx = await usdc.approve(CONTRACT_ADDRESS, parsedAmount);
      await approveTx.wait();

      const donateTx = await fundraising.donate(campaignId, parsedAmount);
      await donateTx.wait();

      alert('✅ Donation successful!');
      setAmount('');
    } catch (error) {
      console.error('❌ Donation error:', error);
      alert('❌ Donation failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>🎁 Donate to Campaign #{campaignId}</h2>

      <input
        type="number"
        placeholder="Amount in USDC"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
      />

      <button
        onClick={handleDonate}
        disabled={loading || !amount}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Donate'}
      </button>
    </div>
  );
};

export default DonatePage;
