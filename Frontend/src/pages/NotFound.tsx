import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return <div className="flex min-h-screen">
      {/* Left side - Primary color */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-foreground/20" />
          <div className="absolute bottom-32 right-20 w-48 h-48 rounded-full bg-primary-foreground/10" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-primary-foreground/15" />
        </div>
      </div>

      {/* Right side - Accent color */}
      <div className="hidden md:flex md:w-1/2 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-10 w-40 h-40 rounded-full bg-accent-foreground/20" />
          <div className="absolute bottom-20 left-16 w-28 h-28 rounded-full bg-accent-foreground/10" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-accent-foreground/15" />
        </div>
      </div>

      {/* Mobile gradient background */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-primary via-primary/80 to-accent" />

      {/* Center content overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-primary-foreground rounded-sm border-secondary-foreground border bg-[sidebar-primary-foreground] bg-white">
        <div className="text-center px-6 py-12 rounded-2xl bg-background/95 backdrop-blur-sm shadow-large max-w-md mx-4 border border-border">
          {/* 404 Number */}
          <h1 className="text-8xl md:text-9xl font-bold gradient-text-brand mb-4 font-heading tracking-tight">
            404
          </h1>

          {/* Oops message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            Oops, page not found
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 text-base">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Return to home button */}
          <Link to="/">
            <Button variant="hero" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>;
};
export default NotFound;