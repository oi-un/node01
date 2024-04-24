const express = require('express'); // express 라이브러리 사용하겠다는 뜻
const app = express();

// 서버 띄우는 코드
// app.listen(port번호, ()=>{});
app.listen(8080, ()=>{
  console.log('http://localhost:8080 에서 서버 실행중');
})

// 간단한 서버 기능 
// 메인페이지 접속시에 반갑다는 문장 전송
app.get('/', (요청, 응답) => {
  응답.send('반갑다');
})