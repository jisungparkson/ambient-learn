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
    const { students } = await req.json();
    console.log('Processing students:', students.length);

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

    // Process each student
    const processedStudents = [];

    for (const student of students) {
      try {
        console.log('Processing student:', student.name);

        // Generate evaluation using OpenAI
        const evaluationPrompt = `
다음 학생의 정보를 바탕으로 교과평어와 행동발달상황을 작성해주세요:

학생명: ${student.name}
학급: ${student.class_name || ''}
학번: ${student.student_number || ''}
기존 평가: ${student.subject_evaluation || '없음'}
기존 행발: ${student.behavior_record || '없음'}

다음 형식으로 JSON 응답해주세요:
{
  "subject_evaluation": "교과 관련 평가 내용 (구체적이고 긍정적으로)",
  "behavior_record": "행동발달상황 (성격, 특성, 활동 참여도 등을 포함하여)"
}

- 각 항목은 100-150자 내외로 작성
- 학생의 발전 가능성과 강점을 중심으로 서술
- 교육적이고 건설적인 내용으로 작성
- 개인정보는 포함하지 않음
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
              { role: 'system', content: 'You are an experienced Korean teacher writing student evaluations.' },
              { role: 'user', content: evaluationPrompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error for student ${student.name}: ${response.status}`);
        }

        const data = await response.json();
        const generatedContent = data.choices[0].message.content;

        let parsedEvaluation;
        try {
          parsedEvaluation = JSON.parse(generatedContent);
        } catch (e) {
          parsedEvaluation = {
            subject_evaluation: "AI 생성 중 오류가 발생했습니다.",
            behavior_record: "AI 생성 중 오류가 발생했습니다."
          };
        }

        // Save to database
        const { data: savedStudent, error: dbError } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            name: student.name,
            class_name: student.class_name || '',
            student_number: student.student_number || '',
            subject_evaluation: student.subject_evaluation || '',
            behavior_record: student.behavior_record || '',
            ai_generated_evaluation: parsedEvaluation.subject_evaluation,
            ai_generated_behavior: parsedEvaluation.behavior_record,
            processing_status: 'completed'
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error for student:', student.name, dbError);
          throw new Error(`Failed to save student ${student.name}`);
        }

        processedStudents.push(savedStudent);

        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Error processing student:', student.name, error);
        
        // Save student with error status
        await supabase
          .from('students')
          .insert({
            user_id: user.id,
            name: student.name,
            class_name: student.class_name || '',
            student_number: student.student_number || '',
            subject_evaluation: student.subject_evaluation || '',
            behavior_record: student.behavior_record || '',
            ai_generated_evaluation: `처리 중 오류 발생: ${error.message}`,
            ai_generated_behavior: `처리 중 오류 발생: ${error.message}`,
            processing_status: 'error'
          });
      }
    }

    console.log('Processed students successfully:', processedStudents.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_count: processedStudents.length,
        students: processedStudents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-students function:', error);
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