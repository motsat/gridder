// MongoDB
// MongoDBサーバーの設定
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// ModelのSchema Class定義する
var CommentsSchema = new Schema({
  title: String,
  body: String,
  date: Date
});

// ModelのSchema Class定義する
var RoomSchema = new Schema({
  title: String,
  password: String,
  body: String,
  date: Date,
  comments: [CommentsSchema], // 1対多を埋め込み型で定義できる
  metadata: {
    votes: Number,
    favs: Number
  }
});

mongoose.model('Room', RoomSchema); // モデル化。model('モデル名', '定義したスキーマクラス')
mongoose.connect('mongodb://localhost/chatroom'); // mongodb://[hostname]/[dbname]

var Room = mongoose.model('Room'); // 定義したときの登録名で呼び出し

// インスタンス生成
var room = new Room();
room.title = 'test title';
room.body = 'this is a pen';

// 埋め込み型カラムはpush()を使う
room.comments.push(
  {title: 'comment title1',
    body: 'comment body1',
    password: 'your password'});

// pre-hookを定義しているとsave時に定義した関数が走る
room.save(function(err) {
  if(!err) console.log('saved!')
});
// 
// データの取得
Room.find({}, function(err, docs) {
  docs.forEach(function(doc){
    console.log(doc);
  });
});

// Room.findOne({}, function(err, doc) {
//   console.log(doc);
// });
