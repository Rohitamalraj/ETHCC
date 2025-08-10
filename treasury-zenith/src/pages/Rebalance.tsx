
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Settings } from "lucide-react";
import DashboardNavigation from "@/components/DashboardNavigation";
import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "treasury_allocations";

const Rebalance = () => {
  const [ethAllocation, setEthAllocation] = useState(50);
  const [usdcAllocation, setUsdcAllocation] = useState(50);
  const [saving, setSaving] = useState(false); // Add loading state
  const [saveSuccess, setSaveSuccess] = useState(false); // Add success state

  

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const { eth, usdc } = JSON.parse(stored);
        setEthAllocation(eth);
        setUsdcAllocation(usdc);
      } catch (error) {
        console.error('Error parsing stored allocation data:', error);
      }
    }
  }, []);

  const handleEthChange = (value: number[]) => {
    const newEthValue = value[0];
    setEthAllocation(newEthValue);
    setUsdcAllocation(100 - newEthValue);
  };

  const handleUsdcChange = (value: number[]) => {
    const newUsdcValue = value[0];
    setUsdcAllocation(newUsdcValue);
    setEthAllocation(100 - newUsdcValue);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    // Save to localStorage
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ eth: ethAllocation, usdc: usdcAllocation })
    );
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Rebalance Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your treasury allocation strategy and rebalancing triggers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Target Allocations */}
          <Card className="glow-card">
            <CardHeader>
              <CardTitle>Target Allocations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ETH Allocation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="eth-allocation">ETH Allocation</Label>
                  <span className="text-sm font-mono">{ethAllocation}%</span>
                </div>
                <Slider
                  id="eth-allocation"
                  value={[ethAllocation]} // Controlled value
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={handleEthChange} // Updates state
                />
              </div>

              {/* USDC Allocation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="usdc-allocation">USDC Allocation</Label>
                  <span className="text-sm font-mono">{usdcAllocation}%</span>
                </div>
                <Slider
                  id="usdc-allocation"
                  value={[usdcAllocation]} // Controlled value
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={handleUsdcChange} // Updates state
                />
              </div>

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                Total allocation must equal 100%
              </div>
            </CardContent>
          </Card>

          {/* Rebalance Trigger */}
          <Card className="glow-card">
            <CardHeader>
              <CardTitle>Rebalance Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  Manual
                </Button>
                <Button variant="outline">
                  Hourly
                </Button>
                <Button variant="outline">
                  Daily
                </Button>
                <Button variant="outline">
                  Threshold-based
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Risk Profile</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30">
                    <div>
                      <div className="font-medium">Conservative</div>
                      <div className="text-sm text-muted-foreground">
                        Prioritizes capital preservation with minimal risk
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-primary bg-primary"></div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30">
                    <div>
                      <div className="font-medium">Balanced</div>
                      <div className="text-sm text-muted-foreground">
                        Balances risk and return for moderate growth
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-border"></div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30">
                    <div>
                      <div className="font-medium">Aggressive</div>
                      <div className="text-sm text-muted-foreground">
                        Maximizes potential returns with higher risk tolerance
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border border-border"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DEX Preview */}
        <Card className="glow-card mt-8">
          <CardHeader>
            <CardTitle>DEX Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-4 font-medium">Token Pair</th>
                    <th className="text-left py-3 px-4 font-medium">Quote</th>
                    <th className="text-left py-3 px-4 font-medium">Slippage</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-border/20">
                    <td className="py-3 px-4 font-mono">ETH/USDC</td>
                    <td className="py-3 px-4">1 ETH = $2,500</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">0.1%</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border/20">
                    <td className="py-3 px-4 font-mono">USDC/ETH</td>
                    <td className="py-3 px-4">1 USDC = 0.0004 ETH</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">0.05%</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="glow-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Slippage Tolerance</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="0.1">0.1%</SelectItem>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-warning">Warning</div>
                  <div className="text-sm text-muted-foreground">
                    Changes to these settings will affect your treasury allocation strategy. Please review carefully before saving.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex flex-col items-end space-y-2">
          <Button className="glow-button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Strategy"}
          </Button>
          {saveSuccess && (
            <span className="text-green-600 text-sm font-medium">Strategy saved!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rebalance;