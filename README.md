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


