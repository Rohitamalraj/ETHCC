/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Filter, Calendar } from "lucide-react";
import DashboardNavigation from "@/components/DashboardNavigation";
import { useState, useMemo, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";

interface Activity {
  timestamp: string;
  action: string;
  result: "Success" | "Failed" | "Pending";
  gasUsed: string;
  txHash: string;
  type: "swap" | "transfer" | "rebalance";
  isRealTime?: boolean;
}

const ActivityLog = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7days");
  
  // Fixed 10 mock transactions - with recent timestamps
  const generateRecentTimestamp = (daysAgo: number, hour: number, minute: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString().slice(0, 16).replace('T', ' ');
  };

  const mockActivities: Activity[] = [
    // Within 7 days (3 transactions)
    {
      timestamp: generateRecentTimestamp(1, 14, 30), // 1 day ago
      action: "Swapped 1 ETH → 3500 USDC",
      result: "Success" as const,
      gasUsed: "0.005 ETH",
      txHash: "0x742d...5B19",
      type: "swap" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(3, 12, 15), // 3 days ago
      action: "Transferred 1000 USDC to Project X",
      result: "Success" as const,
      gasUsed: "0.002 ETH",
      txHash: "0xa123...7d8e",
      type: "transfer" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(6, 10, 0), // 6 days ago
      action: "Rebalanced Portfolio (30% USDC)",
      result: "Success" as const,
      gasUsed: "0.008 ETH",
      txHash: "0xb456...9f1a",
      type: "rebalance" as const,
      isRealTime: false
    },
    
    // Within 30 days but beyond 7 days (4 transactions)
    {
      timestamp: generateRecentTimestamp(10, 16, 45), // 10 days ago
      action: "Transferred 500 USDC to Marketing",
      result: "Failed" as const,
      gasUsed: "0.001 ETH",
      txHash: "0xc789...2b3c",
      type: "transfer" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(15, 14, 20), // 15 days ago
      action: "Swapped 2 ETH → 7000 USDC",
      result: "Success" as const,
      gasUsed: "0.006 ETH",
      txHash: "0xd012...4e5f",
      type: "swap" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(20, 11, 55), // 20 days ago
      action: "Transferred 2000 USDC to Development",
      result: "Pending" as const,
      gasUsed: "0.003 ETH",
      txHash: "0xe345...6g7h",
      type: "transfer" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(25, 9, 30), // 25 days ago
      action: "Swapped 1.5 ETH → 5250 USDC",
      result: "Success" as const,
      gasUsed: "0.005 ETH",
      txHash: "0xf678...8i9j",
      type: "swap" as const,
      isRealTime: false
    },
    
    // Within 90 days but beyond 30 days (3 transactions)
    {
      timestamp: generateRecentTimestamp(45, 17, 10), // 45 days ago
      action: "Rebalanced Portfolio (25% USDC)",
      result: "Success" as const,
      gasUsed: "0.007 ETH",
      txHash: "0x1234...0k1l",
      type: "rebalance" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(60, 15, 45), // 60 days ago
      action: "Swapped 0.75 ETH → 2625 USDC",
      result: "Success" as const,
      gasUsed: "0.004 ETH",
      txHash: "0x5678...2m3n",
      type: "swap" as const,
      isRealTime: false
    },
    {
      timestamp: generateRecentTimestamp(75, 13, 20), // 75 days ago
      action: "Transferred 1250 USDC to Community",
      result: "Failed" as const,
      gasUsed: "0.003 ETH",
      txHash: "0x9012...4o5p",
      type: "transfer" as const,
      isRealTime: false
    }
  ];

  // State for real-time transactions only
  const [realTimeActivities, setRealTimeActivities] = useState<Activity[]>([]);
  const { address } = useWallet();

  // Listen for new transactions
  useEffect(() => {
    if (!window.ethereum || !address) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const handleNewTransaction = async (tx: any) => {
      try {
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const receipt = await provider.getTransactionReceipt(tx.hash);
        
        if (receipt && (tx.to?.toLowerCase() === address.toLowerCase() || tx.from?.toLowerCase() === address.toLowerCase())) {
          const gasUsed = ethers.formatEther(receipt.gasUsed * receipt.gasPrice);
          
          // Determine transaction type and create activity
          let type: Activity['type'] = 'transfer';
          let action = `Transfer ${ethers.formatEther(tx.value)} ETH`;
          
          // Check transaction data to determine type
          if (tx.data && tx.data.length > 2) {
            const methodId = tx.data.slice(0, 10);
            
            if (methodId === '0x38ed1739' || methodId === '0x7ff36ab5') { // Swap function signatures
              type = 'swap';
              action = 'Token swap executed';
            } else if (methodId === '0x1b5636e8' || methodId === '0xa9059cbb') { // Rebalance/transfer function signatures
              if (tx.data.includes('rebalance')) {
                type = 'rebalance';
                action = 'Portfolio rebalanced';
              } else {
                action = `Token transfer (${ethers.formatEther(tx.value)} ETH)`;
              }
            }
          }

          const newActivity: Activity = {
            timestamp,
            action,
            result: receipt.status === 1 ? 'Success' : 'Failed',
            gasUsed: `${parseFloat(gasUsed).toFixed(6)} ETH`,
            txHash: tx.hash,
            type,
            isRealTime: true
          };

          setRealTimeActivities(prev => [newActivity, ...prev]);
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    };

    // Listen for pending transactions
    provider.on('pending', (txHash) => {
      provider.getTransaction(txHash).then((tx) => {
        if (tx && (tx.to?.toLowerCase() === address.toLowerCase() || tx.from?.toLowerCase() === address.toLowerCase())) {
          handleNewTransaction(tx);
        }
      }).catch(console.error);
    });

    return () => {
      provider.removeAllListeners('pending');
    };
  }, [address]);

  // Combine mock and real-time activities
  const allActivities = useMemo(() => {
    // Always include the 10 mock activities, then add real-time activities
    return [...mockActivities, ...realTimeActivities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [realTimeActivities]);

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    return allActivities.filter(activity => {
      // Search query filter
      const matchesSearch = searchQuery === "" ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.txHash.toLowerCase().includes(searchQuery.toLowerCase());

      // Action type filter
      const matchesAction = actionFilter === "all" || activity.type === actionFilter;

      // Result filter
      const matchesResult = resultFilter === "all" || 
        activity.result.toLowerCase() === resultFilter.toLowerCase();

      // Date filter - more precise filtering
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24);
      
      let matchesDate = false;
      switch(dateFilter) {
        case "7days":
          matchesDate = daysDiff <= 7;
          break;
        case "30days":
          matchesDate = daysDiff <= 30;
          break;
        case "90days":
          matchesDate = daysDiff <= 90;
          break;
        case "all":
          matchesDate = true;
          break;
        default:
          matchesDate = daysDiff <= 7; // Default to 7 days
      }

      return matchesSearch && matchesAction && matchesResult && matchesDate;
    });
  }, [allActivities, searchQuery, actionFilter, resultFilter, dateFilter]);

  // Calculate stats based on filtered activities
  const stats = useMemo(() => {
    const successful = filteredActivities.filter(a => a.result === "Success").length;
    const failed = filteredActivities.filter(a => a.result === "Failed").length;
    const pending = filteredActivities.filter(a => a.result === "Pending").length;
    const totalGas = filteredActivities.reduce((acc, curr) => {
      const gasAmount = parseFloat(curr.gasUsed.split(" ")[0]);
      return acc + (isNaN(gasAmount) ? 0 : gasAmount);
    }, 0);

    return {
      total: filteredActivities.length,
      successful,
      failed,
      pending,
      totalGasUsed: totalGas.toFixed(6) + " ETH",
      realTimeCount: filteredActivities.filter(a => a.isRealTime).length,
      mockCount: filteredActivities.filter(a => !a.isRealTime).length
    };
  }, [filteredActivities]);

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setResultFilter("all");
    setDateFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Activity Log</h1>
              <p className="text-muted-foreground mt-2">
                View all actions taken by the Treasurer Agent.
              </p>
            </div>
            <Button variant="outline" onClick={resetFilters} className="mt-2">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Summary - Move to top for better visibility */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="glow-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Filtered</div>
            </CardContent>
          </Card>

          <Card className="glow-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success mb-1">{stats.successful}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </CardContent>
          </Card>

          <Card className="glow-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive mb-1">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </CardContent>
          </Card>

          <Card className="glow-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning mb-1">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card className="glow-card text-center">
            <CardContent className="p-4">
              <div className="text-lg font-bold mb-1">{stats.totalGasUsed}</div>
              <div className="text-xs text-muted-foreground">Total Gas</div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time indicator */}
        {realTimeActivities.length > 0 && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success font-medium">
                {realTimeActivities.length} real-time transaction{realTimeActivities.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="glow-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search transactions or tx hash..." 
                  className="pl-10 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Action Type Filter */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="swap">Swaps Only</SelectItem>
                  <SelectItem value="transfer">Transfers Only</SelectItem>
                  <SelectItem value="rebalance">Rebalances Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Result Type Filter */}
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Last 7 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transaction History</span>
              <div className="text-sm font-normal text-muted-foreground">
                Showing {filteredActivities.length} of {allActivities.length} transactions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Action</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Result</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Gas Used</th>
                    <th className="text-left py-4 px-6 font-medium text-muted-foreground">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="text-muted-foreground">
                          <div className="text-lg mb-2">No activities found</div>
                          <div className="text-sm">
                            {searchQuery || actionFilter !== "all" || resultFilter !== "all" || dateFilter !== "7days" 
                              ? "Try adjusting your filters to see more results."
                              : "No transactions available yet."
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity, index) => (
                      <tr 
                        key={`${activity.txHash}-${index}`} 
                        className="border-b border-border/20 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-sm">{activity.timestamp}</div>
                            {activity.isRealTime && (
                              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" title="Real-time transaction"></div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {activity.type} {activity.isRealTime ? "(Live)" : "(Mock)"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant="secondary" 
                            className={
                              activity.result === 'Success' 
                                ? 'bg-success/20 text-success border-success/30' 
                                : activity.result === 'Failed'
                                  ? 'bg-destructive/20 text-destructive border-destructive/30'
                                  : 'bg-warning/20 text-warning border-warning/30'
                            }
                          >
                            {activity.result}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-mono text-sm">{activity.gasUsed}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80"
                            onClick={() => window.open(`https://etherscan.io/tx/${activity.txHash}`, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityLog;