---
title: Vite
published: 2025-01-04
description: "서비스 개발자로서 미리 읽었더라면 너무 좋았을 책"
image: ""
tags: ["book"]
category: book
draft: true
---

esbuild vite의 통합이 어떻게 이루어 지는지 

vite는 esbuild의 플러그인 시스템인 vite:dep-scan을 만들어, esbuild의 context api를 활용해 

```typescript
async function prepareEsbuildScanner(environment, entries, deps, missing) {
  // 1. vite:dep-scan 플러그인 생성
  const plugin = esbuildScanPlugin(environment, deps, missing, entries);
  



  // 2. esbuild context 생성
  const context = await esbuild.context({
    plugins: [plugin],  // ← vite:dep-scan 플러그인 등록
    // ... 기타 esbuild 옵션
  });
  
  return context;
}

```

vite가 esbuild위에 자신의 로직(플러그인)을 추가합니다. 

`esbuildScanPlugin` 을 호출하여 vite:dep-scan 플러그인을 생성합니다.
그러니깐, Plugin이라는 타입을 반환하기 때문에 이자체가 플러그인입니다. 실제 내부 소스코드엔 vite:dep-scan이라는 이름을 가진 Plugin을 반환합니다

