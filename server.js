const express = require('express'); // express 라이브러리 사용하겠다는 뜻
const app = express();

// 서버 띄우는 코드
// app.listen(port번호, ()=>{});
app.listen(8080, ()=>{
  console.log('http://localhost:8080 에서 서버 실행중');
});

// 간단한 서버 기능 
//유저에게 html 파일 보내주려면 sendFile
app.get('/', (요청, 응답) => {  응답.sendFile(__dirname + '/index.html') });
app.get('/about', (요청, 응답) => {  응답.sendFile(__dirname + '/about.html') });
app.get('/news', (요청, 응답)=>{ 응답.send('오늘 비옴') });
app.get('/shop', (요청, 응답)=>{ 응답.send('쇼핑페이지임') });
