# Neura Swap

**Autonomous Portfolio Manager on Ethereum Sepolia with OKX DEX Integration**

---

## Overview

Neura Swap is a decentralized application that simplifies crypto portfolio management by automating token rebalancing. Users can connect their MetaMask wallet, view their current ETH and USDC balances on the Sepolia testnet, and rebalance their portfolio with a single click. The app integrates the OKX DEX API to fetch real-time swap quotes and routes, while on-chain smart contracts securely execute token swaps.

---

## Workflow

1. **Connect Wallet**  
   User connects their MetaMask wallet configured for Sepolia testnet.

2. **Fetch Balances & Prices**  
   The app queries on-chain token balances (ETH, MockUSDC) and fetches live swap quotes and routing from OKX DEX API.

3. **Set Target Allocation**  
   User sets or uses default portfolio allocation targets (e.g., 40% USDC, 60% ETH).

4. **Calculate Rebalance Plan**  
   Neura Swap computes the token amounts to swap to achieve the target allocation.

5. **Confirm & Execute Swap**  
   User clicks “Rebalance,” confirms the MetaMask transaction, and the smart contract swaps tokens on-chain via the OKX DEX router.

6. **Update Portfolio**  
   The app updates and displays the new token balances post-swap.

---

## Features

- MetaMask wallet integration on Sepolia testnet  
- Real-time portfolio balance and token price display  
- AI-assisted portfolio rebalance calculations  
- OKX DEX API integration for optimized swap routing and quotes  
- Secure on-chain swap execution through smart contracts  
- Clean React.js frontend for smooth user experience  

---

## Problem Solved

Crypto portfolios require constant manual rebalancing to mitigate volatility risks. This process is often complex, slow, and costly. Neura Swap automates and simplifies portfolio management with AI-driven swap recommendations and seamless on-chain execution — making DeFi accessible and efficient for everyone.

---

## Getting Started

### Prerequisites

- Node.js (v16+)  
- MetaMask wallet with Sepolia testnet setup  
- Sepolia testnet ETH (for gas fees)  
- OKX DEX API key (as per hackathon instructions)  

### Tech Stack
- Solidity (smart contracts)
- Hardhat (deployment & testing)
- React.js (frontend)
- ethers.js (blockchain interaction)
- OKX DEX API (swap quotes & routing)
- MetaMask (wallet integration)

### Future Plans
- Support multiple tokens and dynamic portfolio targets
- Enhanced AI models for smarter rebalance strategies
- ERC-4337 smart accounts for seamless onboarding
- Gas optimizations and multi-chain compatibility


