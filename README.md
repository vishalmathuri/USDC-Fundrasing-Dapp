# 💰 Decentralized Fundraising DApp (USDC Based)

A fully decentralized fundraising platform where users can create and contribute to campaigns using USDC tokens. Built using **Solidity**, **React**, **Hardhat**, and **Ethers.js**.

## 🚀 Features

- 📤 Create fundraising campaigns with:
  - Title, description, goal, min donation, deadline, image URL
- 🎁 Donate to campaigns using **Mock USDC**
- ✅ Withdraw funds if campaign meets goal after deadline
- 🔁 Claim refund if campaign fails
- 🧠 Campaign metadata stored on-chain
- 🔐 MetaMask integration for secure transactions

---

## 🛠 Tech Stack

| Layer       | Tech                    |
|-------------|-------------------------|
| Smart Contract | Solidity, Hardhat, OpenZeppelin |
| Frontend       | React, Ethers.js, Tailwind CSS (optional) |
| Blockchain     | Ethereum Sepolia Testnet |
| Tokens         | Mock USDC (ERC20)     |
| Wallet         | MetaMask              |

---

## 📦 Folder Structure

```


---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/vishalmathuri/USDC-Fundrasing-Dapp.git
cd usdc-fundraising-dapp
````

---

### 2. Install dependencies

```bash
# Smart Contract side
npm init --yes
npm install --save-dev hardhat
npx hardhat init


# Frontend side
cd fundraising-frontend
npm install
```

---

### 3. Deploy Smart Contracts

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Update `fundraising-frontend/src/config.js` with:

```js
export const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
export const USDC_ADDRESS = "0xYourMockUSDCAddress";
```

---

### 4. Start Frontend

```bash
cd fundraising-frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Run Tests

```bash
npx hardhat test
```

Includes tests for:

* Campaign creation
* Donations
* Withdrawals
* Refunds
* Event emissions

---

## 🧠 Smart Contract Overview

### `Fundraising.sol`

| Function           | Description                    |
| ------------------ | ------------------------------ |
| `createCampaign()` | Create a new campaign          |
| `donate()`         | Donate USDC to campaign        |
| `withdrawFunds()`  | Transfer funds to beneficiary  |
| `refund()`         | Claim refund if campaign fails |
| `getCampaign()`    | View campaign data             |
| `campaignCount()`  | Get total number of campaigns  |

---

### `MockUSDC.sol`

ERC20 token used for demo donations. Mintable by deployer.

---

## ⚠️ Notes

* Make sure your wallet is connected to **Sepolia** testnet
* Use faucets to get **ETH** and **Mock USDC**
* Donations must be greater than or equal to `minDonation`
* Only campaign creator can withdraw after deadline

---

## 📄 License

This project is licensed under [MIT](LICENSE).

---

## 🙌 Contributing

Pull requests and forks are welcome. For major changes, please open an issue first.

---

## 👨‍💻 Author

**Vishal Kumar Mathuri**
[GitHub](https://github.com/vishalmathuri) | [LinkedIn](https://linkedin.com/in/vishal-mathuri) | [Email](mailto:vishalkumarmathuri@gmail.com)

---

```

Would you like me to generate this README as a downloadable `.md` file too?
```
