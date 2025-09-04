// Edge Function 테스트 스크립트
// Node.js로 실행: node test-edge-function.js

const https = require('https');

const testData = {
  documentType: "기안문",
  title: "테스트 기안문",
  content: "이것은 테스트를 위한 기안문 내용입니다."
};

const options = {
  hostname: 'tnojbrbsprjfvfliosyl.supabase.co',
  port: 443,
  path: '/functions/v1/generate-document',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE', // 실제 토큰으로 교체 필요
    'apikey': 'YOUR_ANON_KEY_HERE' // 실제 anon key로 교체 필요
  }
};

console.log('🔍 Edge Function 테스트 시작...');
console.log('📤 전송 데이터:', testData);

const req = https.request(options, (res) => {
  console.log(`\n📊 응답 상태: ${res.statusCode}`);
  console.log('📋 응답 헤더:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 응답 본문:');
    try {
      const responseData = JSON.parse(body);
      console.log(JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 요청 오류:', error);
});

req.write(JSON.stringify(testData));
req.end();

console.log('\n📝 참고사항:');
console.log('1. YOUR_ACCESS_TOKEN_HERE를 실제 Supabase 액세스 토큰으로 교체');
console.log('2. YOUR_ANON_KEY_HERE를 실제 anon key로 교체');
console.log('3. src/integrations/supabase/client.ts에서 anon key 확인 가능');