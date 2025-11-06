import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Package, ShoppingBag } from "lucide-react";

const Marketplace = () => {
  const items = [
    {
      id: 1,
      name: "Solar Panel Cleaning Kit",
      price: 500,
      category: "Physical",
      stock: 15,
      image: "🧹"
    },
    {
      id: 2,
      name: "Premium Monitoring System",
      price: 2500,
      category: "Physical",
      stock: 8,
      image: "📊"
    },
    {
      id: 3,
      name: "Energy Efficiency Consultation",
      price: 1000,
      category: "Service",
      stock: 20,
      image: "💡"
    },
    {
      id: 4,
      name: "Green Energy Certificate Frame",
      price: 300,
      category: "Physical",
      stock: 25,
      image: "🖼️"
    },
    {
      id: 5,
      name: "Smart Energy Meter",
      price: 1800,
      category: "Physical",
      stock: 12,
      image: "⚡"
    },
    {
      id: 6,
      name: "Carbon Offset Credit (1 ton)",
      price: 5000,
      category: "Digital",
      stock: 100,
      image: "🌱"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Marketplace</h1>
              <p className="text-muted-foreground mt-2">
                Redeem your ZABcoins for eco-friendly products and services
              </p>
            </div>
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 energy-glow">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Balance</p>
                    <p className="text-2xl font-bold">8,542 ZAB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <Card 
                key={item.id} 
                className="glass-card hover:scale-105 transition-transform animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-6xl mb-4">{item.image}</div>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <Coins className="h-4 w-4" />
                        {item.price} ZAB
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">In Stock</span>
                      <span className="font-medium">{item.stock} units</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full energy-glow" disabled={item.price > 8542}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {item.price > 8542 ? "Insufficient Balance" : "Redeem Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
