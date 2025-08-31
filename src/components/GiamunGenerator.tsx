import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, FileText, Loader2, Settings, Download } from 'lucide-react';

interface GiamunData {
  title: string;
  department: string;
  drafter: string;
  date: string;
  purpose: string;
  background: string;
  content: string;
  budget: string;
  schedule: string;
  expected_effect: string;
  appendix: string;
  contact: string;
}

interface GiamunFormData {
  documentType: string;
  title: string;
  details: string;
  department: string;
  drafter: string;
}

const GiamunGenerator: React.FC = () => {
  const [formData, setFormData] = useState<GiamunFormData>({
    documentType: '',
    title: '',
    details: '',
    department: '',
    drafter: ''
  });
  
  const [giamunResult, setGiamunResult] = useState<GiamunData | null>(null);
  const [renderedText, setRenderedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const { toast } = useToast();

  const documentTypes = [
    { value: '기안문', label: '기안문' },
    { value: '공문', label: '공문' },
    { value: '가정통신문', label: '가정통신문' },
    { value: '보고서', label: '보고서' },
    { value: '계획서', label: '계획서' }
  ];

  const renderGiamunFromJson = (data: GiamunData): string => {
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         ${data.title}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 담당 부서: ${data.department}
2. 기안자: ${data.drafter}
3. 기안일자: ${data.date || today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【 기안 목적 】
${data.purpose}

【 추진 배경 】
${data.background}

【 주요 내용 】
${data.content}

${data.budget && data.budget !== '해당 없음' ? `【 예산 내역 】
${data.budget}

` : ''}【 추진 일정 】
${data.schedule}

【 기대 효과 】
${data.expected_effect}

${data.appendix ? `【 첨부 자료 】
${data.appendix}

` : ''}${data.contact ? `【 담당자 연락처 】
${data.contact}

` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※ 본 기안문은 K-에듀파인 시스템 규정에 따라 작성되었습니다.
※ 추가 문의사항은 담당 부서로 연락 바랍니다.

생성 일시: ${today}
    `.trim();
  };

  const handleInputChange = (field: keyof GiamunFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateStats = (text: string) => {
    const charCount = text.length;
    const byteCount = new TextEncoder().encode(text).length;
    return { charCount, byteCount };
  };

  const handleGenerate = async () => {
    if (!formData.documentType || !formData.title || !formData.details) {
      toast({
        title: "입력 오류",
        description: "문서 유형, 제목, 상세 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: {
          documentType: formData.documentType,
          title: formData.title,
          content: formData.details
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || '문서 생성에 실패했습니다.');
      }

      const generatedData = data.generated_content;
      setGiamunResult(generatedData);
      
      // Client-side rendering of the final text
      const finalText = renderGiamunFromJson(generatedData);
      setRenderedText(finalText);

      toast({
        title: "생성 완료",
        description: "기안문이 성공적으로 생성되었습니다.",
      });

    } catch (err: any) {
      setError(err.message);
      toast({
        title: "생성 실패",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!renderedText) return;

    try {
      await navigator.clipboard.writeText(renderedText);
      toast({
        title: "복사 완료",
        description: "기안문이 클립보드에 복사되었습니다.",
      });
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const stats = renderedText ? calculateStats(renderedText) : { charCount: 0, byteCount: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI 기안문 작성 도우미
          </CardTitle>
          <CardDescription>
            K-에듀파인 표준 서식에 맞는 기안문을 AI가 자동으로 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">문서 유형 *</Label>
              <Select value={formData.documentType} onValueChange={(value) => handleInputChange('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="문서 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                placeholder="기안문 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">상세 내용 *</Label>
            <Textarea
              id="details"
              placeholder="기안하고자 하는 내용을 상세히 입력하세요"
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              rows={4}
            />
          </div>

          {/* Advanced Settings */}
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  세부 설정 (선택사항)
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">담당 부서</Label>
                    <Input
                      id="department"
                      placeholder="예: 교무부, 행정실 등"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drafter">기안자</Label>
                    <Input
                      id="drafter"
                      placeholder="기안자 성명"
                      value={formData.drafter}
                      onChange={(e) => handleInputChange('drafter', e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button 
            onClick={handleGenerate} 
            className="w-full bg-gradient-primary hover:opacity-90" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                기안문 생성 중...
              </>
            ) : (
              '기안문 생성하기'
            )}
          </Button>

          {error && (
            <div className="text-destructive text-sm mt-2 p-3 border border-destructive/20 rounded-md bg-destructive/5">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {renderedText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>생성된 기안문</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {stats.charCount}자 / {stats.byteCount}바이트
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyToClipboard}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  복사
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={renderedText}
              readOnly
              rows={20}
              className="font-mono text-sm resize-none"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GiamunGenerator;