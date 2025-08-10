import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Wallet, Settings, Pause, Play } from "lucide-react";
import DashboardNavigation from "@/components/DashboardNavigation";

const Governance = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Governance Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage access and control for the DAO treasury agent.
          </p>
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center space-x-3 mt-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div className="text-sm text-warning">
              Changes affect DAO treasury - proceed with caution.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Access Controls */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Access Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Whitelisted Wallets</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage the list of wallets that have access to the treasury agent.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View ...
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Currently whitelisted:</div>
                  <div className="space-y-1">
                    <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded">
                      0x742d35Cc6251b5B19F5B1d5B19Ab...
                    </div>
                    <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded">
                      0x123d45Cc6251b5B19F5B1d5B19Ac...
                    </div>
                    <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded">
                      0x456d78Cc6251b5B19F5B1d5B19Ad...
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="new-wallet">Add New Wallet</Label>
                <Input 
                  id="new-wallet"
                  placeholder="0x742d35Cc6251b5B19F5B1d5B19..."
                  className="font-mono"
                />
                <Button className="w-full" variant="outline">
                  Add Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Controls */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Agent Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
                      <Pause className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Pause Agent</h3>
                      <p className="text-sm text-muted-foreground">
                        Temporarily halt all agent activities.
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manual Trigger Override</h3>
                      <p className="text-sm text-muted-foreground">
                        Manually trigger agent actions, bypassing automated triggers.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Override...
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Governance Config */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Governance Config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dao-name">DAO Name</Label>
                <Input 
                  id="dao-name"
                  defaultValue="DeFi Protocol DAO"
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treasury-ruleset">Treasury Ruleset ID</Label>
                <Input 
                  id="treasury-ruleset"
                  defaultValue="0x742d35Cc6251b5B19F5B1d5B19Ab123..."
                  className="font-mono bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Emergency Contacts</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Primary contact address" className="font-mono" />
                <Input placeholder="Secondary contact address" className="font-mono" />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Multi-sig Configuration</Label>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Required Signatures</Label>
                  <Input type="number" defaultValue="3" min="1" max="10" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Signers</Label>
                  <Input type="number" defaultValue="5" min="1" max="20" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Timelock (hours)</Label>
                  <Input type="number" defaultValue="24" min="0" max="168" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Security Settings */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <div className="font-medium">Transaction Limit</div>
                  <div className="text-sm text-muted-foreground">
                    Maximum value per transaction (in USD)
                  </div>
                </div>
                <Input 
                  type="number" 
                  defaultValue="100000" 
                  className="w-32 text-right"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <div className="font-medium">Daily Volume Limit</div>
                  <div className="text-sm text-muted-foreground">
                    Maximum daily trading volume (in USD)
                  </div>
                </div>
                <Input 
                  type="number" 
                  defaultValue="500000" 
                  className="w-32 text-right"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <div className="font-medium">Emergency Stop</div>
                  <div className="text-sm text-muted-foreground">
                    Enable emergency stop mechanism
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Changes */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Preview Changes
          </Button>
          <Button className="glow-button">
            Submit Changes to Chain
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Governance;