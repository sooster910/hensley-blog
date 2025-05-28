---
title: 컴포지션과 파이프라인
published: 2025-01-25
description: "유닉스에서 더 많이 알려진 철학을 이용해 컴포지션의 아이디어 알아본 글"
image: "./composition_pipeline.png"
tags: ["FP", "함수형 프로그래밍"]
category: Guides
draft: true
---

## 들어가며

컴포지션을 알아 보면서 유닉스 철학과의 연결에 공감이 갔었던 이야기.

### 유닉스 철학에서 파이프 라인

짧게 유닉스 철학의 핵심은

:::note

1. 각 프로그래밍이 한가지 작업을 잘하게 하라.
2. 모든 프로그래램의 출력이 아직 알려지지 않은 다른 프로그램의 입력 될 것으로 예상한다.

:::

grep 명령어로 검색하는 입력으로 cat 명령어에서 데이터를 전송하고자 할 때 cat 명령어는 데이터를 반환하는걸 알고 있다.
grep 명령어도 검색 연산을 처리하는 데이터를 가져온다는 것을 알고 있다. 따라서 유닉스의 파이프기호를 사용해 처리해야한다.

```bash
cat text.txt | grep 'world'  //결과 : Hello World

```

여기서 파이프 기호는 왼쪽 함수의 출력을 오른쪽 함수의 입력으로 전달. grep 이란 함수는 `grep 'world' test.txt` 로 기본 구성을 보면 cat 으로부터 text.txt 데이터를 받는다는 것을 미리 예상한다.

주어진 텍스트 파일에서 world라는 단어가 몇 개 있는지 세어보기.

```bash
cat text.txt | grep 'word' | wc

```

wc 명령어는 주어진 텍스트에서 단어의 개수를 세는데 사용하는 명령어.

### 함수형 컴포지션

:::note
두 함수를 구성해 새로운 함수를 구현
:::

filter함수에서 온 데이터는 map 함수에 입력 인자로 전달 됨.
함수의 출력을 다른 함수의 입력으로 전달해 두함수를 연결

```typescript
map(filter(books, (book)=> book.rating[0] > 4.5), ()=> ({ title:book.title, author:book.author}))
```

- js문법을 아는 사람이라면, 해당 작업이 무엇을 하는지 수월 하게 알 수 있다. 이 코드에 담겨있는 함수들은 정확히 한가지 일만 한다. 그리고 각 함수들 간에는 `|` 는 없지만 그들 간의 데이터가 오고 갈 것이란걸 예상 하고 있다.
- review 값이 4.5이상이 책들 중 title, author을 추출하는 함수.
- filter에서 온 데이터는 map함수의 인자로 전달 됨 -> 유닉스가 풀어내는 방식과 비슷하다.

함수의 출력을 다른 함수의 입력으로 전달해 두 함수를 연결 하는 함수를 생성하는 방법은 없을까?

compose로 해결이 될 수 있다.

```typescript

const compose = (a,b)=> (c)=> a(b(c))
```

- compose 함수는 2개의 인자를 입력으로 받고 c라는 인자를 갖는 다른 함수를 리턴한다.
- 처리 순서는 오른쪽에서 왼쪽으로 b함수에서 처리한 결과를 a함수가 처리 하는 방식이다.

어떻게 이용할 수 있을까?

#### 1. 주어진 수 반올림 예제

```typescript

 const floatNumber = parseFloat(3.14)
 const roundNumber = Math.round(floatNumber)
 console.log(roundNumber) //3

 const roundFloatNumber = compose(Math.round, parseFloat)
 console.log(roundFloatNumber(3.14)) //3

```

위의 공식으로 풀어내면 다음과 같다.

:::note
number = (c)=> Math.round(parseFloat(c))
:::

#### 2. 문자열 안에 있는 단어의 개수세기

```typescript
 const split = (words)=>words.split(" ")
 const arrayLength = (arr)=> arr.length;

 const countWords = compose(arrayLength, split)
 console.log(countWords("Hello World")) 
```

여태까지 알아본 예제는 모두 단일 함수인 경우이다. 그러니깐 compose를 구성하는 모든 함수가 단일 함수이다.

위에서 언급한 map,filter 함수는 적어도 두개의 인자를 입력으로 받아야 한다.
첫 번째 인자는 배열이고 두 번째 인자는 배열을 연산하는 콜백함수이다. 이런 경우에는 두 함수를 직접 합성하긴 어렵다. 하지만 두개의 인자를 한개의 인자로 받게끔 변경하면 합성이 가능하다. 이걸 실현하는 구체적인 방법은 partial을 이용하는 것이다.

```typescript
map(filter(books, (book)=> book.rating[0] > 4.5), ()=> ({ title:book.title, author:book.author}))
```

#### partial 도움 받기

시나리오를 정해보자 실무에서 자주 다루는 기준값으로 레벨 및 카테고리화 하는 작업을 한다고 가정해보자.

book.rating 을 세 분류 outstanding, good, bad로 나누고
각각의 비즈니스 로직은 5 -outstanding, 4.5-good, 3.5-bad 라고 했을 때 다음과 같이 나눌 수 있다.

```typescript
let filterOutstandingBooks = (book)=> book.rating[0] === 5;
let filterGoodBooks = (book)=> book.rating[0]>4.5
let filterBadBooks = (book)=> book.rating[0]<3.5

```

그리고 데이터 추출 함수도 작성한다.

```typescript
let projectTitleAndAuthor = (book)=> ({title:book.title, author:book.author})
let projectAuthor = (book)=> ({author:book.author})
let projectTitle = (book)=> ({title:book.title})
```

로직을 담당을 분리해 보자.

1. book rating > 4.5 이상인지 확인 하는 함수
2. 

### 마무리

- 함수를 구성하는 이점은 기본 함수를 연결해 새로운 함수를 작성하지 않고도 문제 해결을 할 수 있다는 점.
-
