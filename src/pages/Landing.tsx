import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Leaf, Award, TrendingUp, Shield, Globe } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Zap,
      title: "Install to Earn",
      description: "Register your solar panels and start earning ZABcoin for every kWh generated"
    },
    {
      icon: Award,
      title: "Proof of Green",
      description: "Receive verifiable certificates for your renewable energy contribution"
    },
    {
      icon: Leaf,
      title: "CO₂ Offset Tracking",
      description: "Monitor your environmental impact with real-time carbon offset calculations"
    },
    {
      icon: TrendingUp,
      title: "Bonus Predictions",
      description: "Predict your energy output and win bonus rewards for accurate forecasts"
    },
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "All transactions secured and verified on the blockchain"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Redeem your tokens for eco-friendly products and services"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-32">
        <div className="container px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent energy-glow animate-glow-pulse">
              <Zap className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Power the Future with
              <span className="block gradient-text mt-2">Clean Energy Rewards</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              WattsUp Energy rewards verified renewable energy generation through blockchain-powered tokenized incentives. Generate clean energy, earn ZABcoin, and make a real impact.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="energy-glow" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose WattsUp Energy?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform that rewards your commitment to renewable energy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-4 energy-glow">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-accent text-white relative overflow-hidden">
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of renewable energy producers earning rewards for their contribution to a sustainable future
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link to="/auth">Create Your Account</Link>
            </Button>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </section>
    </div>
  );
};

export default Landing;
