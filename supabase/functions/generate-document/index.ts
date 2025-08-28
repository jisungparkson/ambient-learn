import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, content, title } = await req.json();
    console.log('Document generation request:', { documentType, title });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Generate document using OpenAI
    const prompt = `
당신은 K-에듀파인 기안문 작성 전문가입니다. 다음 조건에 맞는 기안문을 작성해주세요:

문서 유형: ${documentType}
제목: ${title}
내용: ${content}

K-에듀파인 표준 서식에 맞게 JSON 형태로 응답해주세요:
{
  "title": "기안문 제목",
  "department": "담당 부서",
  "drafter": "기안자",
  "date": "기안일자",
  "purpose": "기안 목적",
  "background": "추진 배경",
  "content": "주요 내용",
  "budget": "예산 내역 (해당시)",
  "schedule": "추진 일정",
  "expected_effect": "기대 효과",
  "appendix": "첨부 자료 목록"
}

모든 내용은 한국어로 작성하고, 교육기관에 적합한 공식적인 문체를 사용해주세요.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional Korean educational document writer specializing in K-EDUFINE format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      // If JSON parsing fails, create a structured response
      parsedContent = {
        title: title,
        content: generatedContent,
        generated_at: new Date().toISOString()
      };
    }

    // Save to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title,
        document_type: documentType,
        content: { original: content },
        ai_generated_content: parsedContent,
        status: 'generated'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save document');
    }

    console.log('Document generated successfully:', document.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: document,
        generated_content: parsedContent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});