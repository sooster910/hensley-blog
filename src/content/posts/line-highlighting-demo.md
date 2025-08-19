---
title: "코드 라인 하이라이트 데모"
published: 2024-12-19
updated: 2024-12-19
description: "코드 블록에서 특정 라인을 하이라이트하고 나머지를 dimming하는 기능 데모"
image: ''
tags: [Demo, Code Highlighting, Markdown]
category: 'Examples'
draft: true
---

# 코드 라인 하이라이트 기능

이 포스트에서는 코드 블록에서 특정 라인을 하이라이트하고 나머지 라인을 어둡게(dimming) 보이게 하는 기능을 보여줍니다.

## 기본 사용법

### 단일 라인 하이라이트

```js {2-3,5}
import { defineComponent } from 'vue'

const MyComponent = defineComponent({
  name: 'MyComponent',
  setup() {
    return {
      message: 'Hello, World!'
    }
  }
})

```

