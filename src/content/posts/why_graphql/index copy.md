---
title: GraphQL 도입기:얻게된 새로운 관점
published: 2025-03-11
description: ""
image: "./graphql.gif"
tags: ["React", "GraphQL"]
category: React, GraphQL
draft: false
---

## 들어가며

가맹점 및 클래스 생성 관리, 주문예약 모바일 웹서비스를 구축할 수 있는 좋은 기회를 얻게 되었다. V0에는 런칭을 위한 핵심 기능 구현에 집중했었고, 런칭 후에도 기획들이 지속적으로 변경되면서 새로운 요구사항들이 계속 추가되었다.


## 1. 문제 정의 
### 1.1. 3배의 반복 작업

기획 요청이 들어오면 다음과 같은 패턴으로 작업을 진행했다. 

1. 어드민에서 데이터 관리 기능 구현
2. 백엔드에서 API 엔드포인트 생성
3. 프론트엔드에서 UI 구현

기존 REST API 환경에서는 동일한 도메인 모델임에도 불구하고, 프론트엔드, 백오피스, 어드민 등 각 시스템이 Response와 Request 타입을 따로 정의하고 관리해야 했다.
세 타입이 모두 `가맹점`을 의미하지만 구조가 미묘하게 다르다. 이 문제는 팀 단위에서도 번거롭지만, 프론트엔드 혼자 전체 UI 구조를 설계하고 구현해야 했던 이번 프로젝트에서 특히 크게 체감되었다.
![image](../../../assets/images/why-graphql/duplicated-schema-type.png)

```typescript
// 축약된 버전!!!!
// 백엔드
interface StoreDTO {
  id: number;
  name: string;
  address: string;
  description: string;
}

// 프론트엔드  
interface Store {
  id: string;  
  name: string; 
  address: string; // 추가된 필드
}

// 어드민
interface StoreAdmin {
  id: number;
  name: string;
}
```

## 1.2. 기획 변경 시의 악순환

15시 강남점 타임슬롯에 수업 정보도 함께 보여주세요.라는 요청이 들어왔다고 하자. 
초기 구현은 새로운 API를 만든다. 

```typescript
//GET /timeslots?startTime=15:00&storeName=강남점

// 응답
{
  "timeslots": [
  { "id": 1, "startTime": "15:00", "duration": 60 },
  { "id": 2, "startTime": "16:00", "duration": 60 }
]
}
```

그리고는 기획이 변경되어 수업정보도 보여줘야 하는 상황이 발생했다.
그러면 이제 웹서비스는 수업정보가 필요하니 엔드포인트를 하나더 만든다.

```typescript
//GET /timeslots-with-class?startTime=15:00&storeName=강남점

// 응답
{
  "timeslots": [
    { 
      "id": 1, 
      "startTime": "15:00", 
      "duration": 60,
      "className": "요가 기초반",
      "instructor": "김선생님"
    }
  ]
}


```

그런데 어드민도 같은 기능이 필요한데, 단 관리목적으로 더 많은 정보가 필요하므로 이에 대응하는 
API 응답 구조를 만든다. 


```typescript
// 어드민용 - 수강생 수, 수익 등 추가 정보 필요
//GET /timeslots-admin?startTime=15:00&storeName=강남점

// 응답
{
  "timeslots": [
    { 
      "id": 1, 
      "startTime": "15:00", 
      "duration": 60,
      "className": "요가 기초반",
      "instructor": "김선생님",
      "enrolledCount": 8,    // 어드민만 필요
      "maxCapacity": 10,     // 어드민만 필요
      "revenue": 80000       // 어드민만 필요
    }
  ]
}

```

또 다른 기획이 변경되어 이번엔 웹서비스에서 `예약 가능 여부`도 보여달라고 한다.
이젠 어떤 API를 사용해야할까? 
기존 웹서비스에 사용하던 API를 사용하면 어드민이 깨질수 있으니 
또 하나의 API를 만든다고 하자. 
그리고 나서 3개월 후 코드를 보면서
"어? 이 API는 아직 쓰고 있나? 지워도 되나?"
"어드민과 웹서비스 중 어디서 이 API를 쓰고 있지?"를 고민하는 자신을 보게 된다. 
결국 API에 대한 관리가 안되고 문서화도 없었으며 파악하는데 피로감만 늘어나게 되었다. 


팀 구성원이 변경되어 백엔드까지 혼자 담당하게 된 이후, 이처럼 API는 기능 중심으로만 설계되었다.
딱히 REST의 원칙은 지켜지지 않았고, 문서화도 없었으며, API 응답 구조 또한 일관성이 없었다.
**결국 "표준이 없다" 라는 문제로 정의했다.**

## 2. GraphQL 도입

### 2.1 문제에 대한 도전과제

- 도메인 단위의 타입 일관성 유지 하기
- UI 기획 변경이 API 구조 변경으로 이어지지 않도록 해보기
- 기존 API를 깨지 않고 기능 확장 가능한 구조로 만들기


타입 통일 문제라면 당연히 Swagger OpenAPI나 Zod도 고려했는데, 근본적인 문제는 API의 관리포인트라고 생각했다. Swagger나 Zod 를 사용하더라도 
타입 일원화에는 도움이 되겠지만, 여전히 변경된 기획에 대해 API는 변경되어야 한다.
개인적으로 도구 추가 = 관리포인트 증가 라고 생각했기 때문에 하나의 스키마로 모든 문제를 해결할 수 있는 GraphQL이 더 적합하다고 판단했다. 


---
### 3. 스키마 설계 : 비즈니스 중심 모델 → 클라이언트/UI중심 모델로 오버페칭, 언더페칭 개선

풀스택으로 시작하다보면, 화면에서 요구되는 데이터를 백엔드 관점에서 보게 되는데 처음엔 생소했지만 스키마는 프론트와 백엔드 사이에 있는것으로 보아야 한다. 그러니깐 UI에서 서비스되고 있다라는것을 이해하고 클라이언트 주도가 되어야 한다.
비즈니스 중심 모델 → 클라이언트/UI중심 모델에 대해 조금 더 설명을 해보자면 아래 스키마는 백엔드 중심에 맞춰진 예시다. conversation 은 참여한 id들의 배열을 리턴하는데  관계형 데이터베이스에서 외래키를 사용해 데이터간의 관계를 표현한 걸 그대로 반영했다.

```jsx
type Query {
  conversations: [Conversation]
  person(id: ID): Person
}

type Conversation {
  participantIDs: [ID]
}
```

클라이언트 중심적으로 변경하면 다음과 같다

```jsx
type Query {
  conversations: [Conversation]
}

type Conversation {
  participants: [Person]
  title: String
  lastMessage: String
  receivedAt: String
}

type Person {
  avatarURL: String
}
```

그런데 이런 스키마 설계는 왜 중요할까? 이 설계로 인해 필요한 데이터만 **정확하게 필요한 시점에** 가져와서 과도한 데이터 요청을 줄일 수있다.

GraphQL 쿼리는 graph 자료 구조처럼 노드들이 연결된 구조를 가지는데 클라이언트가 요청한 각 필드마다 **해당 필드 리졸버가 실행**되어 필요한 데이터를 가져온다. 각 필드가 스스로 필요한 데이터를 가져오는 것이다. 이게 GraphQL의 핵심 원칙 중 하나다.

### 4. Relay: 실수를 방지 하는 강제성

GraphQL의 클라이언트를 지원하는 도구(라이브러리 등)를 꼭 사용하지 않아도 된다. GraphQL서버는 HTTP위에서 동작하기 때문에 fetch를 이용해 서버에 요청을 보낼 수 있다.
하지만 GraphQL의 잘 알려진 단점으로는 http캐싱이 어렵다는 점이다. 그런 단점을 GraphQL 클라이언트 도구에서 지원한다.
캐싱 지원 뿐 아니라 사용자 경험 측면에서도 지원해준다. 특히 Relay는 Suspense를 지원하는 데이터 패칭 최적화 라이브러리인데 여기서 Relay가 
어떻게 데이터페칭을 최적화 해주는지는 넘어가도록 하겠다. 해당글은 표준화에 조금 더 초점을 두고 작성할 예정이다.
현재 npm 트렌드로 가장 많이 알려진 건 Apollo지만, **Relay**를 선택했다. **프론트엔드 혼자서 전체 UI 구조를 설계해야 했기 때문에**, 명확한 기준이 필요했다.

Relay는 매우 **opinionated**한 설계 철학을 가지고 있는데, 특히 **pagination과 fragment 중심의 UI 설계**를 강제한다. 얼마나 강제하냐면, fragment의 쿼리 이름이 현재 컴포넌트 이름과 부분 동일시 되지 않으면 컴파일러에서 바로 에러를 내준다. 그리고 없는 타입도 사용하게 되면 바로 에러를 내준다. 이러한 강제성이 유연하지 못한 단점으로 작용해 팀단위에서는 충분히 고려 될 만한 요소이지만,
이번 프로젝트처럼 혼자 전체 UI 구조를 설계하고, 유지보수까지 책임지는 환경에서는 오히려 이런 강제성이 외부에서 구조적으로 방향을 잡아주는 Inversion of Control(프레임워크가 설계 흐름을 주도하는 구조)을 잘 활용한 경험이라고 느꼈다.  
프래그먼트의 강제 규칙성으로 인해 UI구조와 의존성을 1:1로 맞출 수 있다고 한다.  GraphQL로 API를 설계하더라도 클라이언트에서 이를 효과적으로 활용하지 못하면, GraphQL이 제공하는 장점이 반감될 수 있다고 생각했다

>
>
>
> Any GraphQL client for data-driven UI applications that does not have a strong opinion on making "fragments" the unit around which the user-interface components are built, is not leveraging key GraphQL design components nor setting you up for success with complex data-driven UI applications.
>

또한가지는 컴파일러이다.

Relay에서는 `relay-compiler`라는 도구를 사용해 **빌드 시점에 GraphQL 쿼리를 미리 분석하고**, 아래와 같이 **정제된 JavaScript 객체 형태**로 변환해 둔다.

```jsx
//쿼리 요청 

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;

// Relay 컴파일 결과물 (예시)
const GetUserQuery = {
  kind: 'Request',
  operationKind: 'query',
  name: 'GetUser',
  // ...
}

```

이런 쿼리는 문자열 형태로 작성되고 실행시점 그러니깐 런타임에 브라우저안에서 파서가 문자열을 파싱해서 AST로 변경하고 서버로 보내는 과정을 겪게 되는데 즉

**앱 사용자(브라우저)** 가 불필요하게 **GraphQL 문법 해석기**를 포함한 코드(수십~수백 KB)를 다운받지 않아도 된다고 생각했다.

물론 이런 결정에는 트레이드 오프가 있다. relay-compiler와 relay-runtime 으로 나누어 설치를 해야 하는데 개발환경에서 DX가 그리 좋지는 않다고 생각한다.

relay의 strict 한 부분 때문에 GraphQL 쿼리나 스키마가 바뀔 때마다 매 relay-compiler를 다시 돌려야 하는 번거로움이 있다. 물론 watch 도 가능하긴 하지만 기본으로 내재된건 아니니 추가적인 설정이 필요한건 사실이다.


---
### 5. GraphQL Code Generator를 통한 백/프론트/어드민 동기화 
gql 을 사용한다고 해서 동기화가 자동으로 이루어지진 않는다.
GraphQL Code Generator를 사용해 백엔드에서 만들어둔 스키마를 기반으로 여러 클라이언트에서 공통으로 타입을 자동 생성하는 것이 핵심이다.
결국 백엔드의 스키마가 진실의 원천(Single Source of Truth)이 된다 .

### 개선안 다시 정리 
- GraphQL에서는 **스키마가 타입의 단일한 출처(Single Source of Truth)**가 되기 때문에, 중복 정의 없이도 모든 인터페이스에서 같은 기준으로 타입을 공유할 수 있게 되었다.
- 언더페칭과 오버페칭의 문제를 해결해 필요한 만큼의 데이터만 요청할 수 있게 되었다. 
- 스키마 자체가 문서역할을 해 별도의 문서관리 없이 자동문서화가 가능하다. GraphQL Playground/Studio에서 실시간 문서를 확인할 수 있다.
- offset 에서 강제로 cursor based pagination으로 변경되었고 누락의 가능성을 줄였다.
- Relay의 데이터 페칭을 위한 Suspense 기반 선언적 로딩 상태 관리를 통해 명령형 로딩 상태 관리에서 선언적 방식으로 개선할 수 있었다.
- 명령형의 불필요한 리렌더링을 개선해 로딩상태 전환이 체감될 정도로 부드러워졌다.


## 마무리
GraphQL이 모든 문제를 해결해주는 silver bullet은 아니다. 실제로 백엔드에서 해결해야 할 일들이 생각보다 많았고, N+1 쿼리 같은 새로운 성능 이슈도 고려해야 했다.
하지만 트레이드 오프에 따라 이번에는 개인이 여러 시스템을 개발하며 겪는 일관성 부재와 반복 작업의 피로감을 근본적으로 해결이 필요했다.

이전 회사에서 기획→백엔드→프론트엔드 순차 진행을 기획+백엔드+프론트엔드 동시 참여로 바꾸려 했던 시도들이, 결국 GraphQL이 제시하는 협업 방식과 맞닿아 있었다는 걸 깨달았다.
혼자 개발하는 환경에서도 이런 "표준화된 소통 방식"이 일관성 있는 개발을 가능하게 해준 것 같다.
