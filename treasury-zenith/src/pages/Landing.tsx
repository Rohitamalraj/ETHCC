import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Shield, Zap, Github, MessageCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";

const Landing = () => {
  const { isConnected, connectWallet, isConnecting } = useWallet();
  return (
    <div className="min-h-screen hero-gradient">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent"></div>
          <span className="text-xl font-bold">TreasuryAgent</span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="https://github.com/ryuvanraj/treasury-zenith" className="text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Automated
              <br />
              <span className="text-gradient">Treasury Manager</span>
              <br />
              for DAOs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-Powered. MEV-Resistant. Powered by OKX DEX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {isConnected ? (
                <Link to="/dashboard">
                  <Button className="glow-button w-full sm:w-auto">
                    <Wallet className="mr-2 h-5 w-5" />
                    Launch App
                  </Button>
                </Link>
              ) : (
                <Button 
                  className="glow-button w-full sm:w-auto"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
              <Link to="/dashboard">
                <Button variant="outline" className="bg-secondary/50 backdrop-blur-sm border-border/50 w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Dashboard Mockup */}
          <div className="animate-slide-up">
            <Card className="glow-card p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Treasury Overview</h3>
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                </div>
                
                {/* Mock pie chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full" style={{
                      background: `conic-gradient(from 0deg, hsl(var(--chart-1)) 0deg 252deg, hsl(var(--chart-2)) 252deg 360deg)`
                    }}></div>
                    <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">$1.2M</div>
                        <div className="text-xs text-muted-foreground">TVL</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <div className="text-sm text-muted-foreground">ETH</div>
                    <div className="font-semibold">70%</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/30">
                    <div className="text-sm text-muted-foreground">USDC</div>
                    <div className="font-semibold">30%</div>
                  </div>
                </div>

                <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                  Trigger Rebalance
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-xl text-muted-foreground">
            TreasuryAgent offers a suite of tools designed to optimize DAO treasury management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glow-card p-8 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Auto-Rebalancing</h3>
            <p className="text-muted-foreground">
              Automatically rebalances DAO assets to maintain optimal portfolio allocation.
            </p>
          </Card>

          <Card className="glow-card p-8 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-neon-blue to-primary flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">OKX DEX Integration</h3>
            <p className="text-muted-foreground">
              Seamlessly integrates with OKX DEX API for efficient and secure trading.
            </p>
          </Card>

          <Card className="glow-card p-8 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-accent to-neon-blue flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Governance-Safe & Transparent</h3>
            <p className="text-muted-foreground">
              Ensures governance-safe operations with transparent and auditable transactions.
            </p>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="https://github.com/ryuvanraj/treasury-zenith" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <a href="https://discord.com/invite/qFfvVB5KTw" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>Discord</span>
            </a>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 TreasuryAgent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;