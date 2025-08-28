import { Button } from "@/components/ui/button";
import { ArrowRight, Thermometer } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 bg-gradient-hero overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-primary-foreground/5 backdrop-blur-sm"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Icon */}
          <div className="mb-8 flex justify-center">
            <div className="bg-primary-foreground/20 p-4 rounded-2xl">
              <Thermometer className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 font-korean">
            교실의 온도를 측정하세요
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed font-korean">
            AI 기반 교실 분위기 분석으로 더 나은 교육 환경을 만들어보세요
          </p>
          
          {/* Hero Description */}
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-korean">
            학생들의 참여도, 이해도, 만족도를 실시간으로 분석하고 
            개선 방안을 제시하는 혁신적인 교육 도구입니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-education font-korean text-lg px-8"
              onClick={() => window.location.href = '/auth'}
            >
              지금 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-korean text-lg px-8"
              onClick={() => window.location.href = '/auth'}
            >
              데모 체험하기
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-2">1,000+</div>
              <div className="text-primary-foreground/80 font-korean">활용 교실</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-2">95%</div>
              <div className="text-primary-foreground/80 font-korean">만족도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground mb-2">24/7</div>
              <div className="text-primary-foreground/80 font-korean">실시간 분석</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;