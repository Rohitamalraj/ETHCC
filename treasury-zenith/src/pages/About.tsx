import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Github, MessageCircle } from "lucide-react";

const About = () => {
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
          
          <a href="https://github.com/ryuvanraj/treasury-zenith" className="text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </a>
        </div>
      </nav>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gradient">About </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            TreasuryAgent is an innovative, AI-powered treasury management platform for DAOs, built to automate, secure, and optimize digital asset portfolios. Born out of a passion for decentralized finance, it was crafted during a leading blockchain hackathon to address the real needs of DAO communities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="glow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Hackathon Vision</h3>
            <p className="text-muted-foreground">
              TreasuryAgent was conceived at a global hackathon focused on DAO tooling and DeFi innovation. Our mission: empower DAOs with a robust, transparent, and automated treasury solution that is both MEV-resistant and governance-safe.
            </p>
          </Card>

          <Card className="glow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-accent to-neon-blue flex items-center justify-center">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">What Makes Us Unique?</h3>
            <p className="text-muted-foreground">
              <b>AI-driven automation</b> ensures optimal asset allocation, while <b>OKX DEX integration</b> delivers secure, efficient trades. Our platform is designed for transparency, with auditable actions and community-first governance at its core.
            </p>
          </Card>

          <Card className="glow-card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-neon-blue to-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Hackathon Journey</h3>
            <p className="text-muted-foreground">
              Our team collaborated across time zones, blending expertise in smart contracts, AI, and UX. We rapidly prototyped, tested, and iterated—delivering a working demo that wowed judges and peers alike.
            </p>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto mt-16">
          <Card className="glow-card p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-gradient">Meet the Team</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-lg font-semibold">Yuvan Raj</div>
                <a
                  href="https://github.com/ryuvanraj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-blue-600 transition-colors underline"
                >
                  GitHub
                </a>
              </div>
              <div>
                <div className="text-lg font-semibold">Thameemul Azarudeen</div>
                <a
                  href="https://github.com/AZAR2305"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-blue-600 transition-colors underline"
                >
                  GitHub
                </a>
              </div>
              <div>
                <div className="text-lg font-semibold">Rohit Amal Raj</div>
                <a
                  href="https://github.com/Rohitamalraj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-blue-600 transition-colors underline"
                >
                  GitHub
                </a>
              </div>
              <div>
                <div className="text-lg font-semibold">Russel Sasmith</div>
                <a
                  href="https://github.com/Sasmith08"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-blue-600 transition-colors underline"
                >
                  GitHub
                </a>
              </div>
            </div>
            <div className="text-muted-foreground mb-8">
              Special thanks to all hackathon mentors, judges, and the DAO community for their support and feedback.
            </div>
            <div className="flex justify-center gap-4">
              <a href="https://github.com/ryuvanraj/treasury-zenith" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
              <a href="https://discord.com/invite/qFfvVB5KTw" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>Discord</span>
              </a>
            </div>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h3 className="text-xl font-semibold mb-4">Get Involved</h3>
          <p className="text-muted-foreground mb-8">
            We welcome contributions and feedback from the community. Join us on our journey to revolutionize treasury management for DAOs. Explore the code, suggest features, or just say hi!
          </p>
          <Link to="/dashboard">
            <Button className="glow-button">
              Launch App
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
 
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

export default About;