import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Search, 
  Calendar, 
  BookOpen, 
  LogOut,
  Thermometer
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: FileText,
      title: "기안문 작성 도우미",
      description: "K-에듀파인 서식에 맞는 기안문을 AI가 자동으로 작성해드립니다.",
      action: "기안문 작성하기"
    },
    {
      icon: Users,
      title: "생기부 기록 도우미",
      description: "엑셀 파일로 학생 정보를 업로드하고 교과평어와 행동발달상황을 자동 생성합니다.",
      action: "생기부 작성하기"
    },
    {
      icon: Search,
      title: "학교정보 검색",
      description: "RAG 기반 고성능 검색으로 학교 관련 정보를 빠르게 찾아보세요.",
      action: "정보 검색하기"
    },
    {
      icon: Calendar,
      title: "급식 식단표",
      description: "NEIS API를 통해 실시간 급식 정보를 확인하세요.",
      action: "식단표 보기"
    },
    {
      icon: BookOpen,
      title: "월중행사",
      description: "이달의 학교 행사 일정을 한눈에 확인하세요.",
      action: "행사 보기"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Thermometer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-korean font-bold">교실의 온도</h1>
              <p className="text-sm text-muted-foreground">안녕하세요, {user?.email}님!</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">대시보드</TabsTrigger>
            <TabsTrigger value="documents">기안문</TabsTrigger>
            <TabsTrigger value="records">생기부</TabsTrigger>
            <TabsTrigger value="search">정보검색</TabsTrigger>
            <TabsTrigger value="utilities">편의기능</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">교실의 온도 대시보드</h2>
              <p className="text-muted-foreground mb-6">
                AI 기반 교육 도구로 업무 효율성을 높여보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-education transition-all duration-300">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-korean">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      {feature.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  기안문 작성 도우미
                </CardTitle>
                <CardDescription>
                  K-에듀파인 서식에 맞는 기안문을 AI가 자동 작성합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">기안문 작성 기능을 곧 제공할 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  생기부 기록 도우미
                </CardTitle>
                <CardDescription>
                  학생 정보를 업로드하고 교과평어와 행동발달상황을 자동 생성합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">생기부 기록 기능을 곧 제공할 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  학교정보 검색
                </CardTitle>
                <CardDescription>
                  RAG 기반 고성능 검색으로 학교 정보를 빠르게 찾아보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">정보 검색 기능을 곧 제공할 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    급식 식단표
                  </CardTitle>
                  <CardDescription>
                    NEIS API를 통한 실시간 급식 정보
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">급식 식단표 기능을 곧 제공할 예정입니다.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    월중행사
                  </CardTitle>
                  <CardDescription>
                    이달의 학교 행사 일정
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">월중행사 기능을 곧 제공할 예정입니다.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;