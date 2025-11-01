import { Button } from "@/components/ui/button";
import { FileText, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AI AUTO FORM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/auth" className="text-foreground/80 hover:text-foreground transition-colors">
              Login
            </Link>
            <ThemeToggle />
            <Button variant="hero" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-accent/10 rounded-lg transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 space-y-3">
            <Link
              to="/#features"
              className="block py-3 px-4 text-base text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#pricing"
              className="block py-3 px-4 text-base text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/auth"
              className="block py-3 px-4 text-base text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors touch-manipulation"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Button variant="hero" size="lg" className="w-full touch-manipulation" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
