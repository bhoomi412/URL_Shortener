import { Menu, User, Link, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavigationProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
  user?: any;  // User prop to determine if logged in
  onLogout?: () => void;
}

export function Navigation({ onSignInClick, onSignUpClick, user, onLogout }: NavigationProps) {
  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-primary">ShortLink</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              About
            </a>
          </div>

          {/* Desktop Login */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </span>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
             <>
            <Button variant="ghost" className="text-gray-600" onClick={onSignInClick}>
              Sign In
            </Button>
            <Button className="bg-primary text-white hover:bg-primary/90" onClick={onSignUpClick}>
              Sign Up
            </Button>
            </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  <a href="#" className="text-lg text-gray-600 hover:text-primary transition-colors">
                    Home
                  </a>
                  <a href="#" className="text-lg text-gray-600 hover:text-primary transition-colors">
                    Features
                  </a>
                  <a href="#" className="text-lg text-gray-600 hover:text-primary transition-colors">
                    Pricing
                  </a>
                  <a href="#" className="text-lg text-gray-600 hover:text-primary transition-colors">
                    About
                  </a>
                  <div className="border-t pt-6 space-y-4">
                    <Button variant="ghost" className="w-full justify-start text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}