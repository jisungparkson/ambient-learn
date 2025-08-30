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
            선생님의 업무가 쉬워집니다
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed font-korean">
            AI가 도와주는 똑똑한 교사 업무 도우미
          </p>
          
          {/* Hero Description */}
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-korean">
            기안문, 생기부, 공문 작성부터 학교 정보 검색까지<br/>
            선생님의 행정 업무를 AI가 간편하게 도와드립니다. <strong>완전 무료</strong>로 제공됩니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-education font-korean text-lg px-8"
              onClick={() => window.location.href = '/auth'}
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-korean text-lg px-8"
              onClick={() => window.location.href = '/auth'}
            >
              무료 체험하기
            </Button>
          </div>

          {/* Key Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground mb-2 font-korean">완전 무료</div>
              <div className="text-primary-foreground/80 font-korean">회원가입만으로 모든 기능 이용</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground mb-2 font-korean">즉시 활용</div>
              <div className="text-primary-foreground/80 font-korean">복잡한 설정 없이 바로 사용</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground mb-2 font-korean">업무 단축</div>
              <div className="text-primary-foreground/80 font-korean">행정 업무 시간 90% 절약</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;