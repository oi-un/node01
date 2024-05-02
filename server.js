const express = require('express'); // express 라이브러리 사용하겠다는 뜻
const app = express();

// mongoDB 연결
const { MongoClient, ObjectId } = require('mongodb')

const methodOverrid = require('method-override');
app.use(methodOverrid('_method'));

// css, js, 이미지 등은 public 폴더에 보관.
// 해당 public 폴더는 서버에 등록해야 안의 파일 사용 가능
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// 요청.body 쓰려면 필요
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// session 방식 로그인
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
app.use(passport.initialize());
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false
}));
app.use(passport.session()) 


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

app.get('/detail/:id', async (요청, 응답)=>{
  try{
    let result = await db.collection('post').findOne({ _id :
    new ObjectId(요청.params.id)});

    if(result != null){
      console.log(result);
      응답.render('detail.ejs', {result : result});
    } else {
      응답.render('404.ejs');
    }
  }catch(err){
    console.log(err);
    응답.status(404).render('404.ejs');
  }
})

app.get('/edit/:id', async (요청, 응답)=>{
  try{
    let result = await db.collection('post').findOne({ _id :
    new ObjectId(요청.params.id)});

    if(result != null){
      응답.render('edit.ejs', {result : result});
    } else{
      응답.send('url id 잘못 입력함~')
    }
  }catch(err){
    console.log(err);
  }
})
app.post('/edit', async (요청,응답)=>{
  //유저가 보낸 데이터 요청.body                        
  let id = 요청.body.id;
  let title = 요청.body.title;
  let content = 요청.body.content;
  try{
    if(id == null || id == ''){
      응답.send('id 안왔는데?');
    } else{
      if(title == '' || title == null || content == '' || content == null){
        응답.send('title이랑 content 없는데?');
      } else{
        // 글이 너무 길면? : if(content.length){}

        // updateOne({찾을 document}, {수정할 내용})
        let result = await db.collection('post').updateOne({_id: new ObjectId(id)},
        {$set: {title: title, content: content}});
        
        응답.redirect('/list');
      }
    }
  } catch(e) {
    // 에러나면 여기거 해주세용
    console.log(e);
    응답.status(500).send('서버 에러남');
  }
})

app.delete('/delete', async (요청, 응답)=>{
  console.log(요청.query);
  let id = 요청.query.docId;
  await db.collection('post').deleteOne({_id: new ObjectId(id)})
  응답.send('삭제완료');
})

app.get('/list/:id', async (요청, 응답)=>{
  let page = 요청.params.id;
  let skip = (page-1)*5;
  let res = await db.collection('post').find().skip(skip).limit(5).toArray();
  console.log(res[0].title);
  응답.render('list.ejs', { posts: res });
});

app.get('/signup', (요청, 응답) => {
  응답.render('signup.ejs');
})
app.post('/signup', async (요청, 응답) => {
  let username = 요청.body.username;
  let password = 요청.body.password;
  if(userId == '' || userPw == ''){
    응답.send('아이디 비번 제대로 입력해라')
  } else{
    let result = await db.collection('user')
      .insertOne({username: username, password: password});
    console.log(result);
    응답.redirect('/list')
  }
})

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  if (result.password == 입력한비번) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}))

app.get('/login', (요청, 응답, next)=>{
  응답.render('login.ejs');
})
app.post('/login', (요청, 응답, next)=>{
  passport.authenticate('local', (error, user, info) => {
    if (error) return 응답.status(500).json(error)
    if (!user) return 응답.status(401).json(info.message)
    요청.logIn(user, (err) => {
      if (err) return next(err)
      응답.redirect('/')
    })
})(요청, 응답, next)
})