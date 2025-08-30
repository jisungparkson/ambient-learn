import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { 
  BarChart3, 
  BrainCircuit, 
  Users, 
  FileText, 
  Zap, 
  Shield 
} from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "실시간 분위기 분석",
      description: "AI가 교실의 분위기를 실시간으로 측정하고 분석합니다",
      icon: BarChart3,
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-50"
    },
    {
      title: "AI 기반 인사이트",
      description: "머신러닝으로 학습 패턴을 분석하고 개선점을 제안합니다",
      icon: BrainCircuit,
      gradient: "bg-gradient-to-br from-purple-50 to-pink-50"
    },
    {
      title: "학생 참여도 측정",
      description: "개별 학생의 참여도와 이해도를 정확하게 파악합니다",
      icon: Users,
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      title: "상세 리포트 생성",
      description: "분석 결과를 바탕으로 맞춤형 리포트를 자동 생성합니다",
      icon: FileText,
      gradient: "bg-gradient-to-br from-orange-50 to-red-50"
    },
    {
      title: "즉시 피드백",
      description: "실시간으로 교수법 개선 방안을 제시합니다",
      icon: Zap,
      gradient: "bg-gradient-to-br from-yellow-50 to-orange-50"
    },
    {
      title: "안전한 데이터 관리",
      description: "학생 데이터를 안전하게 보호하고 개인정보를 보장합니다",
      icon: Shield,
      gradient: "bg-gradient-to-br from-teal-50 to-cyan-50"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-korean">
              주요 기능
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-korean">
              교실의 온도가 제공하는 혁신적인 교육 분석 도구들을 만나보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                gradient={feature.gradient}
                onAction={() => console.log(`${feature.title} clicked`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-korean">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-korean">
            더 나은 교육 환경을 만들기 위한 첫걸음을 내딛어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-education font-korean">
              무료 체험 시작
            </button>
            <button className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors font-korean">
              자세히 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 font-korean">교실의 온도</h3>
            <p className="text-primary-foreground/80 mb-6 font-korean">
              AI로 더 나은 교육 환경을 만들어갑니다
            </p>
            <div className="text-sm text-primary-foreground/60 font-korean">
              © 2024 교실의 온도. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
