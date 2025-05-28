---
title: 클로저와 고차 함수
published: 2025-03-11
description: "JavaScript의 클로저와 고차 함수 개념을 실제 프로젝트 경험을 통해 이해하기"
image: "./closure.gif"
tags: ["JavaScript", "함수형 프로그래밍", "클로저", "고차함수"]
category: JavaScript
draft: false
---

## 들어가며

JavaScript를 사용하면서 클로저(Closure)와 고차 함수(Higher-Order Functions)라는 개념을 자주 접하게 된다. 이들은 단순히 이론적인 개념이 아니라 실제 개발에서 코드의 가독성과 유지보수성을 크게 향상시킬 수 있는 강력한 도구들이다.

이 글에서는 함수라는 것에 초점을 두고 함수가 생성된 문맥을 클로저가 어떻게 기억하는지, 그리고 일반적인 문제를 특정 함수로 추상화하고 재사용성을 높이는 방법에 대해 이야기해보고자 한다.

## 1. 함수의 문맥과 클로저

### 1.1. 함수가 생성되는 순간의 문맥

함수는 단순히 코드 블록이 아니라, 생성될 때의 환경(문맥)을 기억하는 특별한 객체다. 이 환경에는 변수, 매개변수, 다른 함수들이 포함된다.

```javascript
function createCounter() {
  let count = 0; // 이 변수는 함수가 생성될 때의 문맥에 포함됨
  
  return function increment() {
    count++; // 클로저를 통해 외부 함수의 변수에 접근
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

### 1.2. 클로저가 기억하는 것들

클로저는 함수가 생성될 때의 렉시컬 환경을 기억한다. 이는 단순히 변수 값뿐만 아니라, 변수의 참조를 기억한다는 의미다.

```javascript
function createMultiplier(factor) {
  return function multiply(number) {
    return number * factor; // factor는 외부 함수의 매개변수
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

## 2. 일반적인 문제의 추상화

### 2.1. 반복되는 패턴을 함수로 만들기

일반적인 문제를 특정 함수로 추상화하는 것은 코드의 재사용성을 높이는 핵심이다.

```javascript
// 반복되는 로직을 고차 함수로 추상화
function withLoading(operation) {
  return async function(...args) {
    console.log('로딩 시작...');
    try {
      const result = await operation(...args);
      console.log('로딩 완료!');
      return result;
    } catch (error) {
      console.log('로딩 실패:', error);
      throw error;
    }
  };
}

// 사용 예시
const fetchUserData = withLoading(async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const fetchPostData = withLoading(async (postId) => {
  const response = await fetch(`/api/posts/${postId}`);
  return response.json();
});
```

### 2.2. 설정을 기억하는 함수 만들기

클로저를 활용하여 설정이나 상태를 기억하는 함수를 만들 수 있다.

```javascript
function createAPI(baseURL, defaultHeaders = {}) {
  return function request(endpoint, options = {}) {
    const url = `${baseURL}${endpoint}`;
    const headers = { ...defaultHeaders, ...options.headers };
    
    return fetch(url, {
      ...options,
      headers
    });
  };
}

// 사용 예시
const api = createAPI('https://api.example.com', {
  'Authorization': 'Bearer token123',
  'Content-Type': 'application/json'
});

// 이제 api 함수는 baseURL과 defaultHeaders를 기억하고 있음
const users = await api('/users');
const posts = await api('/posts');
```

## 3. 고차 함수를 통한 재사용성 향상

### 3.1. 함수를 인자로 받는 패턴

고차 함수는 함수를 인자로 받아서 더 유연한 추상화를 가능하게 한다.

```javascript
// 조건부 실행을 추상화
function when(condition, action) {
  return function(...args) {
    if (condition(...args)) {
      return action(...args);
    }
  };
}

// 사용 예시
const logIfError = when(
  (result) => result.error,
  (result) => console.error('에러 발생:', result.error)
);

const validateAndSave = when(
  (data) => data.isValid,
  (data) => saveToDatabase(data)
);
```

### 3.2. 함수를 반환하는 패턴

함수를 반환하는 고차 함수는 설정이나 동작을 커스터마이징할 수 있는 함수를 만들 때 유용하다.

```javascript
function createValidator(rules) {
  return function validate(data) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      if (!rule(data[field])) {
        errors.push(`${field} 검증 실패`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

// 사용 예시
const userValidator = createValidator({
  name: (name) => name && name.length > 0,
  email: (email) => email && email.includes('@'),
  age: (age) => age && age >= 18
});

const result = userValidator({
  name: '홍길동',
  email: 'hong@example.com',
  age: 25
});
```

## 4. 실제 프로젝트에서의 활용

### 4.1. 이벤트 핸들러의 문맥 기억

클로저를 활용하여 이벤트 핸들러가 필요한 데이터를 기억하도록 할 수 있다.

```javascript
function createButtonHandler(userId, action) {
  return function handleClick(event) {
    event.preventDefault();
    console.log(`사용자 ${userId}가 ${action}을 수행했습니다.`);
    // 추가 로직...
  };
}

// 사용 예시
const editButton = document.getElementById('edit-btn');
const deleteButton = document.getElementById('delete-btn');

editButton.addEventListener('click', createButtonHandler(123, '편집'));
deleteButton.addEventListener('click', createButtonHandler(123, '삭제'));
```

### 4.2. 상태 관리 패턴

클로저를 활용한 간단한 상태 관리 패턴을 만들 수 있다.

```javascript
function createStore(initialState) {
  let state = initialState;
  const listeners = [];
  
  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  };
}

// 사용 예시
const userStore = createStore({ name: '', email: '' });

userStore.subscribe((state) => {
  console.log('상태 변경:', state);
});

userStore.setState({ name: '홍길동' });
```

## 5. 성능과 메모리 고려사항

### 5.1. 클로저의 메모리 관리

클로저는 외부 함수의 변수를 참조하므로, 메모리 누수를 방지하기 위해 주의가 필요하다.

```javascript
// 메모리 누수 가능성이 있는 예시
function createHeavyObject() {
  const heavyData = new Array(1000000).fill('data');
  
  return function process() {
    // heavyData를 참조하므로 가비지 컬렉션되지 않음
    return heavyData.length;
  };
}

// 개선된 예시
function createLightweightProcessor() {
  return function process(data) {
    // 필요한 데이터를 매개변수로 받아 참조를 유지하지 않음
    return data.length;
  };
}
```

### 5.2. 함수 생성 최적화

고차 함수를 사용할 때는 불필요한 함수 생성을 피해야 한다.

```javascript
// 비효율적: 매번 새로운 함수 생성
function inefficient() {
  return items.map(item => item * 2); // 매번 새로운 화살표 함수 생성
}

// 효율적: 함수를 미리 정의
const double = item => item * 2;
function efficient() {
  return items.map(double); // 재사용 가능한 함수 사용
}
```

## 마무리

클로저와 고차 함수는 JavaScript에서 함수를 더욱 강력하게 만들어주는 핵심 개념이다. 클로저는 함수가 생성된 문맥을 기억하여 상태를 유지할 수 있게 해주고, 고차 함수는 일반적인 문제를 추상화하여 재사용 가능한 코드를 만들 수 있게 해준다.

이러한 개념들을 적절히 활용하면, 더 깔끔하고 유지보수하기 쉬운 코드를 작성할 수 있으며, 복잡한 로직도 함수 단위로 모듈화하여 관리할 수 있다. 다만 성능과 메모리 사용량을 고려하여 적절히 사용하는 것이 중요하다.
