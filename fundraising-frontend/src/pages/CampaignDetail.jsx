import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  USDC_ADDRESS,
  USDC_ABI,
} from '../config';
import { connectWallet } from '../utils/wallet';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [status, setStatus] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [userDonation, setUserDonation] = useState('0');
  const [loading, setLoading] = useState(false);

  const loadCampaign = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getCampaign(id);

      const now = Math.floor(Date.now() / 1000);
      const totalCollected = Number(data.totalCollected);
      const goal = Number(data.goal);
      const deadline = Number(data.deadline);
      const withdrawn = data.withdrawn;

      let statusText = '';
      if (withdrawn) statusText = 'withdrawn';
      else if (totalCollected >= goal && now >= deadline) statusText = 'successful';
      else if (now > deadline) statusText = 'failed';
      else statusText = 'active';

      setCampaign(data);
      setStatus(statusText);

      const { signer } = await connectWallet();
      const userAddress = await signer.getAddress();
      const userDonationRaw = await contract.donations(id, userAddress);
      setUserDonation(ethers.utils.formatUnits(userDonationRaw, 6));
    } catch (error) {
      console.error('❌ Error loading campaign:', error);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      return alert('⚠️ Enter a valid amount');
    }

    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const parsedAmount = ethers.utils.parseUnits(donationAmount, 6);

      const current = await contract.getCampaign(id);
      const now = Math.floor(Date.now() / 1000);
      if (now > Number(current.deadline)) {
        return alert("⛔ Campaign has ended.");
      }

      if (parsedAmount.lt(current.minDonation)) {
        return alert(`⛔ Minimum donation is ${ethers.utils.formatUnits(current.minDonation, 6)} USDC`);
      }

      const approveTx = await usdc.approve(CONTRACT_ADDRESS, parsedAmount);
      await approveTx.wait();

      const donateTx = await contract.donate(id, parsedAmount);
      await donateTx.wait();

      alert('✅ Donation successful!');
      setDonationAmount('');
      await loadCampaign();
    } catch (err) {
      console.error('❌ Donate failed:', err);
      alert('❌ Donation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.refund(id);
      await tx.wait();

      alert('✅ Refund successful!');
      await loadCampaign();
    } catch (err) {
      console.error('❌ Refund failed:', err);
      alert('Refund failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
    // eslint-disable-next-line
  }, []);

  if (!campaign) return <div>Loading campaign...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>📢 Campaign #{id}</h2>
      <p><strong>Name:</strong> {campaign.name}</p>
      <p><strong>Description:</strong> {campaign.description}</p>
      <p><strong>Goal:</strong> {ethers.utils.formatUnits(campaign.goal, 6)} USDC</p>
      <p><strong>Raised:</strong> {ethers.utils.formatUnits(campaign.totalCollected, 6)} USDC</p>
      <p><strong>Deadline:</strong> {new Date(Number(campaign.deadline) * 1000).toLocaleString()}</p>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Your Donation:</strong> {userDonation} USDC</p>

      {status === 'active' && (
        <>
          <input
            type="number"
            placeholder="Enter donation amount (USDC)"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', marginTop: '1rem' }}
          />
          <button onClick={handleDonate} disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Processing...' : 'Donate'}
          </button>
        </>
      )}

      {status === 'failed' && parseFloat(userDonation) > 0 && (
        <button onClick={handleRefund} disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Processing...' : 'Claim Refund'}
        </button>
      )}

      {status === 'successful' && <p>✅ Campaign succeeded! Funds withdrawn: {campaign.withdrawn ? 'Yes' : 'No'}</p>}
      {status === 'withdrawn' && <p>✅ Campaign funds have already been withdrawn.</p>}
    </div>
  );
};

export default CampaignDetail;
