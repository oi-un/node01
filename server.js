const express = require('express'); // express 라이브러리 사용하겠다는 뜻
const app = express();

// css, js, 이미지 등은 public 폴더에 보관.
// 해당 public 폴더는 서버에 등록해야 안의 파일 사용 가능
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
// 요청.body 쓰려면 필요
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// mongoDB 연결
const { MongoClient } = require('mongodb')

let db;
let id = 'cyj15945';
let pwd = 'qwer123';
const url = `mongodb+srv://${id}:${pwd}@cluster0.lqyccjp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum');
  // 서버 띄우는 코드
  // app.listen(port번호, ()=>{});
  app.listen(8080, ()=>{
    console.log('http://localhost:8080 에서 서버 실행중');
  })
}).catch((err)=>{
  console.log(err)
})

// 간단한 서버 기능 
//유저에게 html 파일 보내주려면 sendFile
app.get('/', (요청, 응답) => {  응답.sendFile(__dirname + '/index.html') });
app.get('/about', (요청, 응답) => {  응답.sendFile(__dirname + '/about.html') });
app.get('/news', (요청, 응답)=>{
  db.collection('post').insertOne({title: '어쩌구'});
  // 응답.send('오늘 비옴') 
  });
app.get('/shop', (요청, 응답)=>{ 응답.send('쇼핑페이지임') });
app.get('/list', async (요청, 응답)=>{
  let res = await db.collection('post').find().toArray();
  console.log(res[0].title);
  응답.render('list.ejs', { posts: res });
});
app.get('/time', (요청, 응답)=>{
  let time = new Date();
  응답.render('time.ejs', {time: time})
})
app.get('/write',(요청, 응답)=>{
  응답.render('write.ejs');
})
app.post('/add', async (요청,응답)=>{
  //유저가 보낸 데이터 요청.body
  console.log(요청.body);
  try{
    // 여기 코드 먼저 하고
    if(요청.body.title == ''){
      응답.send('제목 입력 안했는데?');
    } else {
      await db.collection('post').insertOne({title: 요청.body.title, content: 요청.body.content});
      응답.redirect('/list');
    }
  } catch(e) {
    // 에러나면 여기거 해주세용
    console.log(e);
    응답.status(500).send('서버 에러남');
  }
})
