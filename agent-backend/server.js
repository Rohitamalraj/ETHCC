import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import OffChainArbitrageBot from './src/offChainArbitrageBot.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize the arbitrage bot
const bot = new OffChainArbitrageBot();

// Treasury rebalance endpoint
app.post('/api/treasury/trigger-rebalance', async (req, res) => {
  try {
    console.log('\n🎯 === REBALANCE REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { wethAmount, usdcAmount, percentage, walletAddress, targetEthPercent, targetUsdcPercent } = req.body;
    
    console.log('🎯 Rebalance request received:');
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   Current WETH: ${wethAmount}`);
    console.log(`   Current USDC: ${usdcAmount}`);
    console.log(`   Current deviation: ${percentage}%`);
    console.log(`   Target ETH: ${targetEthPercent || 50}%`);
    console.log(`   Target USDC: ${targetUsdcPercent || 50}%`);

    // Parse amounts
    const currentWethAmount = parseFloat(wethAmount);
    const currentUsdcAmount = parseFloat(usdcAmount);
    const targetEthPercentage = parseFloat(targetEthPercent || 50);
    const targetUsdcPercentage = parseFloat(targetUsdcPercent || 50);

    // Get ETH price for calculations
    const ethPrice = await bot.getEthPrice();
    
    // Calculate current portfolio value in USD
    const currentEthValueUsd = currentWethAmount * ethPrice;
    const totalPortfolioValueUsd = currentEthValueUsd + currentUsdcAmount;
    
    // Calculate target values
    const targetEthValueUsd = totalPortfolioValueUsd * (targetEthPercentage / 100);
    const targetUsdcValueUsd = totalPortfolioValueUsd * (targetUsdcPercentage / 100);
    
    // Calculate required rebalancing
    const ethDifferenceUsd = targetEthValueUsd - currentEthValueUsd;
    const usdcDifferenceUsd = targetUsdcValueUsd - currentUsdcAmount;
    
    console.log('📊 Rebalancing calculations:');
    console.log(`   Total Portfolio: $${totalPortfolioValueUsd.toFixed(2)}`);
    console.log(`   Target ETH Value: $${targetEthValueUsd.toFixed(2)}`);
    console.log(`   Target USDC Value: $${targetUsdcValueUsd.toFixed(2)}`);
    console.log(`   ETH difference: $${ethDifferenceUsd.toFixed(2)}`);
    console.log(`   USDC difference: $${usdcDifferenceUsd.toFixed(2)}`);

    let swapResult = null;
    let newWethBalance = currentWethAmount;
    let newUsdcBalance = currentUsdcAmount;

    // Determine which direction to swap
    if (Math.abs(ethDifferenceUsd) > 1) { // Only rebalance if difference > $1
      if (ethDifferenceUsd > 0) {
        // Need more ETH, swap USDC -> WETH
        const usdcToSwap = Math.abs(ethDifferenceUsd);
        const wethToReceive = usdcToSwap / ethPrice;
        
        console.log(`🔄 Swapping ${usdcToSwap.toFixed(2)} USDC -> ${wethToReceive.toFixed(6)} WETH`);
        
        // Simulate the arbitrage opportunity check
        const USDC_ADDRESS = process.env.USDC_ADDRESS;
        const WETH_ADDRESS = process.env.WETH_ADDRESS;
        const swapAmountBigInt = BigInt(Math.floor(usdcToSwap * 1e6)); // Convert to USDC decimals
        
        const opportunity = await bot.checkArbitrageOpportunity(USDC_ADDRESS, WETH_ADDRESS, swapAmountBigInt);
        
        if (opportunity && opportunity.isProfitable) {
          console.log('✅ Profitable swap opportunity found!');
          await bot.executeArbitrage(opportunity);
          
          // Calculate new balances after swap (accounting for slippage and fees)
          const actualWethReceived = parseFloat(bot.formatAmount(opportunity.toAmount, WETH_ADDRESS));
          newWethBalance = currentWethAmount + actualWethReceived;
          newUsdcBalance = currentUsdcAmount - usdcToSwap;
          
          swapResult = {
            direction: 'USDC->WETH',
            inputAmount: usdcToSwap,
            outputAmount: actualWethReceived,
            profit: opportunity.netProfitUSD
          };
        } else {
          console.log('❌ Swap not profitable enough, skipping rebalance');
          return res.status(400).json({ 
            error: 'Rebalance not profitable', 
            opportunity: opportunity ? {
              netProfitUSD: opportunity.netProfitUSD,
              minRequired: bot.config.minProfitUSD
            } : null 
          });
        }
        
      } else {
        // Need more USDC, swap WETH -> USDC
        const ethToSwap = Math.abs(ethDifferenceUsd) / ethPrice;
        const usdcToReceive = Math.abs(ethDifferenceUsd);
        
        console.log(`🔄 Swapping ${ethToSwap.toFixed(6)} WETH -> ${usdcToReceive.toFixed(2)} USDC`);
        
        // Simulate the arbitrage opportunity check
        const WETH_ADDRESS = process.env.WETH_ADDRESS;
        const USDC_ADDRESS = process.env.USDC_ADDRESS;
        const swapAmountBigInt = BigInt(Math.floor(ethToSwap * 1e18)); // Convert to WETH decimals
        
        const opportunity = await bot.checkArbitrageOpportunity(WETH_ADDRESS, USDC_ADDRESS, swapAmountBigInt);
        
        if (opportunity && opportunity.isProfitable) {
          console.log('✅ Profitable swap opportunity found!');
          await bot.executeArbitrage(opportunity);
          
          // Calculate new balances after swap (accounting for slippage and fees)
          const actualUsdcReceived = parseFloat(bot.formatAmount(opportunity.toAmount, USDC_ADDRESS));
          newWethBalance = currentWethAmount - ethToSwap;
          newUsdcBalance = currentUsdcAmount + actualUsdcReceived;
          
          swapResult = {
            direction: 'WETH->USDC',
            inputAmount: ethToSwap,
            outputAmount: actualUsdcReceived,
            profit: opportunity.netProfitUSD
          };
        } else {
          console.log('❌ Swap not profitable enough, skipping rebalance');
          return res.status(400).json({ 
            error: 'Rebalance not profitable', 
            opportunity: opportunity ? {
              netProfitUSD: opportunity.netProfitUSD,
              minRequired: bot.config.minProfitUSD
            } : null 
          });
        }
      }
    } else {
      console.log('✅ Portfolio already well balanced, no rebalance needed');
    }

    // Calculate new percentages
    const newEthValueUsd = newWethBalance * ethPrice;
    const newTotalValueUsd = newEthValueUsd + newUsdcBalance;
    const newEthPercent = (newEthValueUsd / newTotalValueUsd) * 100;
    const newUsdcPercent = (newUsdcBalance / newTotalValueUsd) * 100;

    const response = {
      success: true,
      message: 'Rebalance completed successfully',
      originalBalances: {
        weth: currentWethAmount,
        usdc: currentUsdcAmount,
        ethPercent: (currentEthValueUsd / totalPortfolioValueUsd) * 100,
        usdcPercent: (currentUsdcAmount / totalPortfolioValueUsd) * 100
      },
      newBalances: {
        weth: newWethBalance,
        usdc: newUsdcBalance,
        ethPercent: newEthPercent,
        usdcPercent: newUsdcPercent
      },
      swap: swapResult,
      ethPrice: ethPrice,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 Rebalance completed:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ Rebalance error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: 'Sepolia Testnet'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Treasury API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Rebalance endpoint: http://localhost:${PORT}/api/treasury/trigger-rebalance`);
});

export default app;
