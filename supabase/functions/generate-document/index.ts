import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // 요청 ID 생성 (디버깅용)
  const requestId = crypto.randomUUID();
  console.log(`[요청 ${requestId}] Edge Function 시작:`, { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[요청 ${requestId}] CORS preflight 요청 처리`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 요청 메서드 검증
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '허용되지 않은 요청 메서드입니다. POST 메서드만 지원합니다.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 요청 데이터 파싱 및 유효성 검사
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '요청 데이터를 파싱할 수 없습니다. 올바른 JSON 형식인지 확인해주세요.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { documentType, content, title } = requestData;
    console.log(`[요청 ${requestId}] 문서 생성 요청:`, { documentType, title, contentLength: content?.length });

    // 필수 데이터 유효성 검사
    if (!documentType || !title || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '필수 입력값이 누락되었습니다. documentType, title, content는 모두 필수입니다.',
          missingFields: {
            documentType: !documentType,
            title: !title,
            content: !content
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 데이터 타입 및 길이 검증
    if (typeof documentType !== 'string' || typeof title !== 'string' || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'documentType, title, content는 모두 문자열이어야 합니다.',
          errorCode: 'INVALID_DATA_TYPE' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // 문자열 길이 검증
    if (title.length > 200 || content.length > 5000) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '제목은 200자, 내용은 5000자를 초과할 수 없습니다.',
          errorCode: 'CONTENT_TOO_LONG',
          limits: { title: 200, content: 5000 } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // API 키 검증 강화
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey || openAIApiKey.trim() === '') {
      console.error('OpenAI API key is missing or empty');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase 환경변수 검증
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables missing:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Supabase 구성이 올바르지 않습니다. 관리자에게 문의해주세요.',
          errorCode: 'SUPABASE_CONFIG_ERROR' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 인증 헤더 검증 강화
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '인증 토큰이 누락되었습니다. 로그인을 다시 시도해주세요.' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '잘못된 인증 토큰 형식입니다.' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let user;
    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error('Authentication error:', userError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `인증 오류: ${userError.message}` 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (!authUser) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: '인증되지 않은 사용자입니다. 로그인을 다시 시도해주세요.' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      user = authUser;
    } catch (authException) {
      console.error('Authentication exception:', authException);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '인증 처리 중 오류가 발생했습니다.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced prompt generation for K-EDUFINE documents
    const createGiamunPrompt = (documentType: string, title: string, content: string) => {
      const EXAMPLES_DATA = {
        "공문": {
          example: "수업료 감면 신청에 관한 건",
          structure: "제목, 담당부서, 기안자, 기안일자, 목적, 배경, 내용, 일정, 기대효과"
        },
        "가정통신문": {
          example: "학부모 상담주간 운영 안내",
          structure: "제목, 발송일자, 대상, 목적, 내용, 협조사항, 문의처"
        },
        "기안문": {
          example: "교육활동 예산 편성에 관한 기안",
          structure: "제목, 담당부서, 기안자, 기안일자, 목적, 배경, 내용, 예산내역, 일정, 기대효과"
        }
      };

      const docInfo = EXAMPLES_DATA[documentType as keyof typeof EXAMPLES_DATA] || EXAMPLES_DATA["기안문"];
      
      return `당신은 K-에듀파인 기안문 작성 전문가입니다. 다음 조건에 맞는 ${documentType}을 작성해주세요:

문서 유형: ${documentType}
제목: ${title}
상세 내용: ${content}

참고 예시: ${docInfo.example}
구조: ${docInfo.structure}

다음 JSON 형식으로 정확히 응답해주세요:
{
  "title": "문서 제목",
  "department": "담당 부서",
  "drafter": "기안자",
  "date": "기안일자 (YYYY-MM-DD 형식)",
  "purpose": "기안 목적",
  "background": "추진 배경",
  "content": "주요 내용 (상세하고 구체적으로)",
  "budget": "예산 내역 (해당 시에만, 없으면 '해당 없음')",
  "schedule": "추진 일정",
  "expected_effect": "기대 효과",
  "appendix": "첨부 자료 목록 (필요 시)",
  "contact": "담당자 연락처 정보"
}

모든 내용은 한국어로 작성하고, 교육기관에 적합한 공식적인 문체를 사용해주세요. JSON 형식을 정확히 지켜주세요.`;
    };

    const prompt = createGiamunPrompt(documentType, title, content);

    // OpenAI API 호출 강화
    let response;
    let data;
    
    try {
      console.log(`[요청 ${requestId}] OpenAI API 호출 시작`);
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional Korean educational document writer specializing in K-EDUFINE format. Always respond with valid JSON format.' 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2500,
          timeout: 60,
        }),
      });
      
      console.log(`[요청 ${requestId}] OpenAI API 응답 상태:`, response.status, response.statusText);
      
    } catch (fetchError) {
      console.error('OpenAI API 호출 실패:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API 호출 중 네트워크 오류가 발생했습니다: ${fetchError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!response.ok) {
      let errorMessage = `OpenAI API 오류 (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += `: ${errorData.error.message || errorData.error}`;
        }
      } catch (parseError) {
        // 에러 응답 파싱 실패 시 기본 메시지 사용
        console.error('Error response parsing failed:', parseError);
      }
      
      console.error('OpenAI API error:', errorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage 
        }),
        { 
          status: response.status >= 500 ? 500 : 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    try {
      data = await response.json();
      console.log(`[요청 ${requestId}] OpenAI API 응답 파싱 성공`);
    } catch (jsonError) {
      console.error('OpenAI API 응답 파싱 실패:', jsonError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API 응답을 파싱할 수 없습니다.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid OpenAI API response structure:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API로부터 올바르지 않은 응답을 받았습니다.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const generatedContent = data.choices[0].message.content;

    // JSON 파싱 강화
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
      console.log(`[요청 ${requestId}] 생성된 콘텐츠 JSON 파싱 성공`);
      
      // JSON 구조 검증
      if (!parsedContent.title || !parsedContent.content) {
        console.warn('생성된 JSON에 필수 필드가 누락됨, 기본값 사용');
        parsedContent = {
          ...parsedContent,
          title: parsedContent.title || title,
          content: parsedContent.content || generatedContent
        };
      }
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.log('원본 콘텐츠:', generatedContent);
      
      // JSON 파싱 실패 시 구조화된 응답 생성
      parsedContent = {
        title: title,
        department: '미지정',
        drafter: '미지정',
        date: new Date().toISOString().split('T')[0],
        purpose: '기안 목적',
        background: '추진 배경',
        content: generatedContent,
        budget: '해당 없음',
        schedule: '추진 일정',
        expected_effect: '기대 효과',
        appendix: '',
        contact: '',
        generated_at: new Date().toISOString(),
        parsing_error: true
      };
    }

    // 데이터베이스 저장 강화
    let document;
    try {
      console.log(`[요청 ${requestId}] 데이터베이스에 문서 저장 시도`);
      const { data: savedDocument, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: title,
          document_type: documentType,
          content: { original: content },
          ai_generated_content: parsedContent,
          status: 'generated',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error details:', dbError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `데이터베이스 저장 실패: ${dbError.message}`,
            dbError: dbError
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      document = savedDocument;
      console.log(`[요청 ${requestId}] 데이터베이스 저장 성공:`, document?.id);
      
    } catch (dbException) {
      console.error('Database exception:', dbException);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `데이터베이스 작업 중 예외 발생: ${dbException.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[요청 ${requestId}] 문서 생성 완료:`, document?.id);

    // 성공 응답 반환
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '기안문이 성공적으로 생성되었습니다.',
        document: document,
        generated_content: parsedContent,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    // 예상치 못한 오류 처리
    console.error(`[요청 ${requestId}] Unexpected error in generate-document function:`, error);
    
    // 오류 로깅 강화
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', errorInfo);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `예상치 못한 오류가 발생했습니다: ${error.message}`,
        errorCode: 'UNEXPECTED_ERROR',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});