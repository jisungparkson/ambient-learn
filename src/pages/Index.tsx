import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import { 
  FileEdit, 
  BookOpen, 
  Search 
} from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "AI 기안문 작성 도우미",
      description: "K-에듀파인 기안문, 가정통신문, 공문 초안을 AI가 순식간에 완성해 드립니다. 복잡한 공문 양식도 간단한 입력만으로 전문적인 문서가 완성됩니다.",
      icon: FileEdit,
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-50"
    },
    {
      title: "AI 생기부 기록 도우미",
      description: "학생 관찰 기록(엑셀)만 업로드하면, 개별 특성에 맞는 생기부 문구를 AI가 자동으로 생성합니다. 각 학생의 성향과 특징을 반영한 맞춤형 기록이 가능합니다.",
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      title: "학교정보 AI 검색",
      description: "복잡한 공문이나 규정 속에서 필요한 정보를 AI 검색으로 1초 만에 찾아보세요. 교육부 지침, 학교 규정, 업무 매뉴얼까지 모든 정보를 즉시 확인할 수 있습니다.",
      icon: Search,
      gradient: "bg-gradient-to-br from-purple-50 to-pink-50"
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
              선생님의 업무를 효율적으로 도와주는 AI 기반 교육 도구를 경험해보세요
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
            지금 바로 무료로 시작하세요
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-korean">
            선생님의 소중한 시간을 절약하고, 더 의미 있는 교육에 집중할 수 있도록 도와드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-education font-korean">
              무료로 시작하기
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
              AI로 선생님의 업무 효율성을 높이고, 교육의 질을 향상시킵니다
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
