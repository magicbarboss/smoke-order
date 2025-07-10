import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bar Ordering System</h1>
        <p className="text-xl text-muted-foreground mb-8">Manage your inventory and orders efficiently</p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/auth">Sign In / Sign Up</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/beverages">View Beverages</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
