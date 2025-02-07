---
title: Typescript의 Freshness
published: 2024-06-29
description: "구조적으로 타입 호환성이 있는 객체 리터럴의 타입 검사를 쉽게 할 수 있도록 해주는 신선도(Freshness)개념"
image: "./freshness.png"
tags: ["TypeScript"]
category: TypeScript
draft: true
---

리서치를 하다 알게된 것이 Freshness 라는 것인데, 사실 이 용어가 TypeScript공식문서에서 서치했을때 찾을 수 없는 것으로 보아 공식적으로 사용되는 용어는 아닌것 같다. 하지만 몇 자료를 통해  상황을 설명하기위해 쓰인 단어로 시작해 퍼진것 같다.

:::note

- 객체 리터럴: 변수를 초기화하면서 객체 리터럴을 사용한 경우와 함수 호출 시점에 즉석에서 생성된 객체로 간주되며, 초과 속성 검사를 엄격히 적용한다. (fresh object)
- 변수에 저장된 객체: 재사용되거나 다른 곳에서도 사용될 가능성이 있다고 간주되며, 초과 속성을 허용 한다.
변수에 저장된 객체가 함수의 매개변수 타입인 인자로 넘겨질 경우 구조적 타입 검사를 수행한다( Loss of freshness)

:::

```typescript

interface NewDog {
  color: string;
  name: string;
}

// Case 1: 변수에 저장된 객체 할당
const dogg = { color: "", name: "", species: "" };
let newDog: NewDog = dogg; // ✅ 정상 동작

// Case 2: 객체 리터럴 직접 할당
newDog = { color: "", name: "", species: "" }; // ❌ 오류

```
