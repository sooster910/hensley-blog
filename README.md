# 개인 블로그
- Astro 기반 정적 페이지 블로그 
- powered by [🍥Fuwari](https://fuwari.vercel.app)

## 📱 Open Graph 지원

이 블로그는 Open Graph 메타 태그를 완전히 지원합니다:

- **자동 이미지 타입 감지**: PNG, JPG, GIF, WebP, SVG 등
- **동적 이미지 경로 처리**: 포스트별 이미지 자동 연결
- **소셜 미디어 최적화**: Facebook, Twitter, LinkedIn 등에서 미리보기 지원
- **보안 URL 지원**: HTTPS 이미지 URL 자동 생성

### 포스트 이미지 설정

포스트의 `frontmatter`에서 이미지를 설정하면 자동으로 Open Graph에 포함됩니다:

```yaml
---
title: "포스트 제목"
image: "./my-image.png"  # 상대 경로 지원
---
```

## 🎨 코드 라인 하이라이트 기능

이 블로그는 astro에 내장된 `@shikijs/transformers` 를 이용해 코드 블록에서 특정 라인을 하이라이트하고 나머지 라인을 어둡게(dimming) 보이게 하는 기능을 지원합니다.

### 사용법

```markdown
```javascript{1,3-5}
const message = "Hello, World!";
const greeting = "안녕하세요!";
console.log(message);
alert(greeting);
return message;
```
```

### 문법

- `{1}` - 1번째 라인만 하이라이트
- `{1,3}` - 1번째와 3번째 라인 하이라이트
- `{2-4}` - 2번째부터 4번째까지 라인 하이라이트
- `{1,3-5}` - 1번째와 3-5번째 라인 하이라이트

### 지원 언어

JavaScript, Python, CSS, HTML, TypeScript, JSX 등 모든 언어에서 사용 가능합니다.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                             | Action                                           |
|:------------------------------------|:-------------------------------------------------|
| `pnpm install` AND `pnpm add sharp` | Installs dependencies                            |
| `pnpm dev`                          | Starts local dev server at `localhost:4321`      |
| `pnpm build`                        | Build your production site to `./dist/`          |
| `pnpm preview`                      | Preview your build locally, before deploying     |
| `pnpm new-post <filename>`          | Create a new post                                |
| `pnpm astro ...`                    | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro --help`                 | Get help using the Astro CLI                     |
| `node test-og.cjs`                  | Test Open Graph meta tags                        |


