import { Button } from "@/components/ui/button";
import { BookOpen, User, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-primary shadow-education border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary-foreground font-korean">
              교실의 온도
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
              대시보드
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
              분석 도구
            </Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
              리포트
            </Button>
            <Button 
              variant="secondary" 
              className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => window.location.href = '/auth'}
            >
              <User className="h-4 w-4 mr-2" />
              로그인
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/20">
              대시보드
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/20">
              분석 도구
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/20">
              리포트
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => window.location.href = '/auth'}
            >
              <User className="h-4 w-4 mr-2" />
              로그인
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;