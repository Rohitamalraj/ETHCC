import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ExternalLink, TrendingUp, Send } from "lucide-react";
import DashboardNavigation from "@/components/DashboardNavigation";
import { useEffect, useState, useCallback } from "react";
import { useAllocation } from "@/context/AllocationContext";
import { ethers } from "ethers";

const LOCAL_STORAGE_KEY = "treasury_allocations";
const MOCK_BALANCES_KEY = "mock_treasury_balances";
const REBALANCED_FLAG_KEY = "has_been_rebalanced";

const Dashboard = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUsdc, setIsLoadingUsdc] = useState<boolean>(false);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0); // Start with 0, will be loaded from wallet
  const [totalPortfolioValue, settotalPortfolioValue] = useState<string>("0.00");
  const [triggerStatus, setTriggerStatus] = useState<string>("");
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [hasBeenRebalanced, setHasBeenRebalanced] = useState<boolean>(false);

  // Add target allocation state (default to 50/50, update from rebalance page)
  const [targetEthPercent, setTargetEthPercent] = useState<number>(50);
  const [targetUsdcPercent, setTargetUsdcPercent] = useState<number>(50);

  // Load stored allocations and mock balances on mount
  useEffect(() => {
    // Load target allocations
    const storedAllocations = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedAllocations) {
      try {
        const { eth, usdc } = JSON.parse(storedAllocations);
        setTargetEthPercent(eth);
        setTargetUsdcPercent(usdc);
      } catch (error) {
        console.error('Error parsing stored allocation data:', error);
      }
    }

    // Load mock balances if they exist
    const storedMockBalances = localStorage.getItem(MOCK_BALANCES_KEY);
    const rebalancedFlag = localStorage.getItem(REBALANCED_FLAG_KEY);
    
    if (storedMockBalances && rebalancedFlag === 'true') {
      try {
        const { ethBalance: mockEth, usdcBalance: mockUsdc } = JSON.parse(storedMockBalances);
        setEthBalance(mockEth);
        setUsdcBalance(mockUsdc);
        setHasBeenRebalanced(true);
      } catch (error) {
        console.error('Error parsing stored mock balances:', error);
      }
    }
  }, []);

  // Fetch real-time ETH price in USD
  const fetchEthPrice = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setEthPrice(data.ethereum.usd);
    } catch (err) {
      console.error("Error fetching ETH price:", err);
    }
  };

  // Connect to MetaMask and get account
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error("MetaMask connection error:", err);
      }
    }
  };

  // Fetch ETH balance from Sepolia (only if not rebalanced)
  const fetchEthBalance = useCallback(async (address: string) => {
    if (window.ethereum && address && !hasBeenRebalanced) {
      try {
        // Sepolia chainId is 0xaa36a7
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        // Convert balance from Wei to ETH
        setEthBalance((parseInt(balance, 16) / 1e18).toFixed(4));
      } catch (err) {
        console.error("Error fetching ETH balance:", err);
      }
    }
  }, [hasBeenRebalanced]);

  // Fetch USDC balance from contract (only if not rebalanced)
  const fetchUsdcBalance = useCallback(async (address: string) => {
    if (window.ethereum && address && !hasBeenRebalanced) {
      try {
        setIsLoadingUsdc(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const usdcAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; // Replace with actual USDC contract address
        const ERC20_ABI = [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];
        const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
        const balanceRaw = await usdcContract.balanceOf(address);
        const decimals = await usdcContract.decimals();
        const balanceFormatted = Number(balanceRaw) / Math.pow(10, decimals);
        setUsdcBalance(balanceFormatted);
      } catch (err) {
        console.error("Error fetching USDC balance:", err);
        // If error fetching real balance, set a fallback value
        setUsdcBalance(0);
      } finally {
        setIsLoadingUsdc(false);
      }
    }
  }, [hasBeenRebalanced]);

  // Connect and fetch balance on mount or when account changes
  useEffect(() => {
    connectWallet();
    fetchEthPrice();
    const priceInterval = setInterval(fetchEthPrice, 10000); // update price every 10s
    return () => clearInterval(priceInterval);
  }, []);

  useEffect(() => {
    if (account && !hasBeenRebalanced) {
      fetchEthBalance(account);
      fetchUsdcBalance(account);
      // Poll for real-time updates every 10s (only if not rebalanced)
      const interval = setInterval(() => {
        fetchEthBalance(account);
        fetchUsdcBalance(account);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [account, hasBeenRebalanced, fetchEthBalance, fetchUsdcBalance]);

  // Calculate USD value of ETH balance
  const ethBalanceUsd = (parseFloat(ethBalance) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Calculate total portfolio value
  const totalValue = parseFloat(ethBalanceUsd.replace(/,/g, "")) + usdcBalance;

  // Calculate live percentages
  const ethPercent = totalValue > 0 ? ((parseFloat(ethBalanceUsd.replace(/,/g, "")) / totalValue) * 100).toFixed(0) : "0";
  const usdcPercent = totalValue > 0 ? ((usdcBalance / totalValue) * 100).toFixed(0) : "0";

  // Calculate target USD values based on target percentages
  const targetEthUsdValue = (totalValue * targetEthPercent / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const targetUsdcUsdValue = (totalValue * targetUsdcPercent / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Mock rebalancing function
  const performMockRebalance = (currentEthBalance: number, currentUsdcBalance: number, totalPortfolioValue: number) => {
    // Calculate target amounts in USD
    const targetEthUsdAmount = totalPortfolioValue * (targetEthPercent / 100);
    const targetUsdcAmount = totalPortfolioValue * (targetUsdcPercent / 100);
    
    // Convert ETH target from USD to ETH
    const targetEthAmount = targetEthUsdAmount / ethPrice;
    
    // Calculate the swap needed
    const ethDifference = currentEthBalance - targetEthAmount;
    const usdcDifference = targetUsdcAmount - currentUsdcBalance;
    
    let swapDetails = null;
    
    if (Math.abs(ethDifference) > 0.01) { // Only rebalance if difference is significant
      if (ethDifference > 0) {
        // Need to sell ETH for USDC
        const ethToSell = ethDifference;
        const usdcToReceive = ethToSell * ethPrice * 0.999; // 0.1% slippage
        swapDetails = {
          direction: 'ETH->USDC',
          inputAmount: ethToSell,
          outputAmount: usdcToReceive,
          profit: usdcToReceive * 0.001 // Mock 0.1% profit
        };
      } else {
        // Need to buy ETH with USDC
        const ethToBuy = Math.abs(ethDifference);
        const usdcToSpend = ethToBuy * ethPrice * 1.001; // 0.1% slippage
        swapDetails = {
          direction: 'USDC->ETH',
          inputAmount: usdcToSpend,
          outputAmount: ethToBuy,
          profit: usdcToSpend * 0.001 // Mock 0.1% profit
        };
      }
    }
    
    return {
      newBalances: {
        weth: targetEthAmount,
        usdc: targetUsdcAmount
      },
      swap: swapDetails
    };
  };

  // Function to send WETH and USDC values to agent-backend (now mocked)
  const handleTriggerRebalance = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setIsTriggering(true);
    setTriggerStatus('Analyzing rebalance opportunity...');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const wethAmount = parseFloat(ethBalance);
      const usdcAmount = usdcBalance;
      const percentage = Math.abs(parseFloat(ethPercent) - targetEthPercent).toFixed(2);

      // Mock the rebalancing logic
      const rebalanceResult = performMockRebalance(wethAmount, usdcAmount, totalValue);

      // Update balances with the mock results
      const newEthBalance = rebalanceResult.newBalances.weth.toFixed(4);
      const newUsdcBalance = Math.round(rebalanceResult.newBalances.usdc);

      setEthBalance(newEthBalance);
      setUsdcBalance(newUsdcBalance);
      setHasBeenRebalanced(true);

      // Store the mock balances in localStorage
      localStorage.setItem(MOCK_BALANCES_KEY, JSON.stringify({
        ethBalance: newEthBalance,
        usdcBalance: newUsdcBalance
      }));
      localStorage.setItem(REBALANCED_FLAG_KEY, 'true');

      // Show success message with swap details
      if (rebalanceResult.swap) {
        setTriggerStatus(`✅ Swapped ${rebalanceResult.swap.inputAmount.toFixed(4)} ${rebalanceResult.swap.direction.split('->')[0]} → ${rebalanceResult.swap.outputAmount.toFixed(4)} ${rebalanceResult.swap.direction.split('->')[1]} (Profit: $${rebalanceResult.swap.profit.toFixed(2)})`);
      } else {
        setTriggerStatus('✅ Portfolio already balanced - no rebalance needed');
      }
      
      // Clear status after 8 seconds
      setTimeout(() => {
        setTriggerStatus('');
      }, 8000);

    } catch (error) {
      console.error('Rebalance error:', error);
      setTriggerStatus(`❌ Error: ${error.message}`);
      setTimeout(() => setTriggerStatus(''), 5000);
    } finally {
      setIsTriggering(false);
    }
  };

  // Function to reset to real balances (for testing purposes)
  const resetToRealBalances = () => {
    localStorage.removeItem(MOCK_BALANCES_KEY);
    localStorage.removeItem(REBALANCED_FLAG_KEY);
    setHasBeenRebalanced(false);
    if (account) {
      fetchEthBalance(account);
      fetchUsdcBalance(account);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    ETH Balance {hasBeenRebalanced ? "(Rebalanced)" : "(Sepolia)"}
                  </p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "Loading..." : `${ethBalance} ETH`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "" : `≈ $${ethBalanceUsd} USD`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account ? `Wallet: ${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}
                  </p>
                  {hasBeenRebalanced && (
                    <Badge variant="secondary" className="mt-1 text-xs bg-green-500/20 text-green-400">
                      Rebalanced
                    </Badge>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h PnL</p>
                  <p className="text-2xl font-bold text-success">+$8,420</p>
                  <p className="text-xs text-success">+0.68%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Positions</p>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">ETH, USDC</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rebalances</p>
                  <p className="text-2xl font-bold">{hasBeenRebalanced ? "48" : "47"}</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-1/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Treasury Overview - Larger Card */}
          <div className="lg:col-span-2">
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Treasury Overview
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      Active
                    </Badge>
                    {hasBeenRebalanced && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        Rebalanced
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(from 0deg, hsl(var(--chart-1)) 0deg ${(parseFloat(ethPercent) / 100) * 360}deg, hsl(var(--chart-2)) ${(parseFloat(ethPercent) / 100) * 360}deg 360deg)`
                        }}
                      ></div>
                      <div className="absolute inset-8 rounded-full bg-card flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Portfolio</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Token Allocation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Current Token Allocation</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-chart-1"></div>
                          <span className="font-medium">ETH</span>
                          <Badge variant="outline" className="text-xs">
                            Target: {targetEthPercent}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{ethPercent}%</div>
                          <div className="text-sm text-muted-foreground">Current: ${ethBalanceUsd}</div>
                          <div className="text-sm text-blue-400">Target: ${targetEthUsdValue}</div>
                          <div className={`text-xs ${Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? "text-green-400" : parseFloat(ethPercent) > targetEthPercent ? "text-orange-400" : "text-red-400"}`}>
                            {Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? "✅ Balanced" :
                             parseFloat(ethPercent) > targetEthPercent
                              ? `+${(parseFloat(ethPercent) - targetEthPercent).toFixed(1)}% over target`
                              : `${(targetEthPercent - parseFloat(ethPercent)).toFixed(1)}% under target`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full bg-chart-2"></div>
                          <span className="font-medium">USDC</span>
                          <Badge variant="outline" className="text-xs">
                            Target: {targetUsdcPercent}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{usdcPercent}%</div>
                          <div className="text-sm text-muted-foreground">Current: ${usdcBalance.toLocaleString()}</div>
                          <div className="text-sm text-blue-400">Target: ${targetUsdcUsdValue}</div>
                          <div className={`text-xs ${Math.abs(parseInt(usdcPercent) - targetUsdcPercent) <= 2 ? "text-green-400" : parseInt(usdcPercent) < targetUsdcPercent ? "text-red-400" : "text-orange-400"}`}>
                            {Math.abs(parseInt(usdcPercent) - targetUsdcPercent) <= 2 ? "✅ Balanced" :
                             parseInt(usdcPercent) < targetUsdcPercent
                              ? `${(targetUsdcPercent - parseInt(usdcPercent)).toFixed(1)}% under target`
                              : `+${(parseInt(usdcPercent) - targetUsdcPercent).toFixed(1)}% over target`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/30">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Rebalance Needed</span>
                        <span className={`${Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? "text-green-400" : "text-orange-400"}`}>
                          {Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? "Balanced" : "High Priority"}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/30 rounded-full h-2 mb-4">
                        <div 
                          className={`h-2 rounded-full ${Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? "bg-green-400" : "bg-orange-400"}`} 
                          style={{ width: Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? '100%' : '75%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full glow-button" 
                        onClick={handleTriggerRebalance} 
                        disabled={isTriggering || (Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2)}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {isTriggering ? 'Processing...' : 
                         Math.abs(parseFloat(ethPercent) - targetEthPercent) <= 2 ? 'Portfolio Balanced' : 'Trigger Rebalance'}
                      </Button>
                      
                      {hasBeenRebalanced && (
                        <Button 
                          variant="outline" 
                          className="w-full text-xs" 
                          onClick={resetToRealBalances}
                        >
                          Reset to Real Balances (Dev)
                        </Button>
                      )}
                    </div>
                    
                    {(triggerStatus || isTriggering) && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        triggerStatus.includes('❌') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        triggerStatus.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {isTriggering && !triggerStatus ? 'Analyzing rebalance opportunity...' : triggerStatus}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Treasury Details */}
                <div className="pt-6 border-t border-border/30">
                  <h3 className="text-lg font-semibold mb-4">Detailed Holdings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ETH Balance</span>
                        <span className="font-mono">
                          {isLoading ? "Loading..." : `${ethBalance} ETH`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ETH Value (USD)</span>
                        <span className="font-mono">
                          {isLoading ? "Loading..." : `$${ethBalanceUsd}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Wallet Address</span>
                        <span className="font-mono text-xs break-all">
                          {account ? account : "Not Connected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Network</span>
                        <span className="font-mono">Sepolia {hasBeenRebalanced && "(Mocked)"}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">USDC Balance</span>
                        <span className="font-mono">
                          {isLoadingUsdc && !hasBeenRebalanced ? "Loading..." : `${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">USDC Price</span>
                        <span className="font-mono">$1.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">24h Change</span>
                        <span className="font-mono">0.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Balance Type</span>
                        <span className="font-mono text-xs">
                          {hasBeenRebalanced ? "Rebalanced (Mock)" : "Real Wallet"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Last Rebalance Status */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span>Last Rebalance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Date/Time:</div>
                  <div className="font-medium">
                    {hasBeenRebalanced ? new Date().toLocaleString() : "2024-01-15 14:30"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Result:</div>
                  <Badge className="bg-success/20 text-success border-success/30">Success</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Transaction:</div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View on Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Rebalance Toggle */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle>Auto-Rebalance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-sm text-success">ON</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Trigger Frequency:</div>
                  <div className="font-medium">Daily</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Risk Profile:</div>
                  <Badge variant="outline">Balanced</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  Configure Settings
                </Button>
              </CardContent>
            </Card>
            {/* Live Quote Preview */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle>Live Quote (OKX DEX)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ETH/USDC</span>
                  <span className="font-mono">$3,500</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slippage</span>
                  <span className="text-sm">0.1%</span>
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                  Last updated: 2s ago
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;