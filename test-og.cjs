#!/usr/bin/env node

const http = require('http');
const https = require('https');

// 테스트할 URL들
const testUrls = [
  'http://localhost:4322/posts/closure-higher-order-functions/',
  'http://localhost:4322/posts/freshness/',
  'http://localhost:4322/'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractOGTags(html) {
  const ogTags = {};
  const twitterTags = {};
  
  // Open Graph 태그 추출
  const ogMatches = html.match(/<meta property="og:([^"]+)" content="([^"]+)"/g);
  if (ogMatches) {
    ogMatches.forEach(match => {
      const [, property, content] = match.match(/<meta property="og:([^"]+)" content="([^"]+)"/);
      ogTags[property] = content;
    });
  }
  
  // Twitter Card 태그 추출
  const twitterMatches = html.match(/<meta name="twitter:([^"]+)" content="([^"]+)"/g);
  if (twitterMatches) {
    twitterMatches.forEach(match => {
      const [, property, content] = match.match(/<meta name="twitter:([^"]+)" content="([^"]+)"/);
      twitterTags[property] = content;
    });
  }
  
  return { ogTags, twitterTags };
}

async function testOGTags() {
  console.log('🔍 Open Graph 메타 태그 테스트 시작...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`📄 테스트 URL: ${url}`);
      const response = await fetchUrl(url);
      
      if (response.statusCode === 200) {
        const { ogTags, twitterTags } = extractOGTags(response.data);
        
        console.log('✅ Open Graph 태그:');
        Object.entries(ogTags).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        
        console.log('\n✅ Twitter Card 태그:');
        Object.entries(twitterTags).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        
        // 이미지 접근성 테스트
        if (ogTags.image) {
          try {
            const imageResponse = await fetchUrl(ogTags.image);
            console.log(`\n🖼️  이미지 접근성: ${imageResponse.statusCode === 200 ? '✅ 접근 가능' : '❌ 접근 불가'}`);
          } catch (error) {
            console.log(`\n🖼️  이미지 접근성: ❌ 오류 - ${error.message}`);
          }
        }
      } else {
        console.log(`❌ 페이지 접근 실패: ${response.statusCode}`);
      }
      
      console.log('\n' + '='.repeat(80) + '\n');
    } catch (error) {
      console.log(`❌ 오류: ${error.message}\n`);
    }
  }
}

// 스크립트 실행
testOGTags().catch(console.error);
