var mongoose = require('mongoose'),
    schemas  = require('./mongoschema').schemas();

for (var i=0; i < schemas.length; i++) {
  mongoose.model(schemas[i].name, schemas[i].schema);
}

//
//mongoose.connect('mongodb://localhost/gridder',
//  function (err) {
//    if (err) {
//      exitWithError(err);
//    }
//  }
//}
//); // mongodb://[hostname]/[dbname]
//
//var Task = mongoose.model('Task'); // 定義したときの登録名で呼び出し
//
//////// インスタンス生成
//var task = new Task(
//{ title       : 'hoge title',
//  is_complete : false,
//  parent      : []
//}
//);

// 1.クライアントがつないできたらsendする。
// 2.クライアント側はもだったjsonから組み立て

// task.title       = 'test title';
// task.is_complete = false;
// task.parent = [];
//
//
// //// 埋め込み型カラムはpush()を使う
// // room.comments.push(
// //  {title: 'comment title1',
// //    body: 'comment body1',
// //    password: 'your password'});
// //
// //// pre-hookを定義しているとsave時に定義した関数が走る
//task.save(function(err) {
//  if (err) {
//    console.log(err);
//  }else {
//    console.log('saved!');
//  }
//});
//////
////// データの取得
////Room.find({}, function(err, docs) {
////  //docs.forEach(function(doc){
////  //  console.log(doc);
////  //});
////});
//
//
//
//
//
//
//
//
//
//
//
var io            = require('socket.io'),
    express       = require('express'),
    objects       = [],
    ACTION_TYPE   = {'REQUEST_CREATE' : 'REQUEST_CREATE',  // クライアントからの作成要求
                     'CREATE'         : 'CREATE'        ,  // クラインとへの作成指示（REQUEST_CREATE後)
                     'REQUEST_LOCK'   : 'REQUEST_LOCK'  ,  // サーバへのロック要求
                     'LOCK'           : 'LOCK'          ,  // クラインとへのロック指示(REQUEST_EDIT)要求クライアント以外に送るもの
                     'REQUEST_EDIT'   : 'REQUEST_EDIT'  ,  // サーバへの編集要求
                     'EDIT'           : 'EDIT'             // クライントへの編集指示（REQUEST_EDIT後)
                    };

var app = express.createServer();
app.configure(function() {
    app.set('views', __dirname + '/views')
       .use(express.static(__dirname + '/public'))
       .set("view options", { layout: false })
       .get('/', function(req, res) {
         res.render('index.ejs');
       });
});

app.listen(8000);

var socket = io.listen(app);
socket.on('connection', function(client) {
  client.on('message', function(msg) {onMessage(msg, client);});
  client.on('disconnect', function() {onDisconnect(client)});
});

//function addMessage(msg)
//{
//  msg.id  = objects.length + 1;
//  msg.createdAt = nowDate();
//  if (msg.option.color == '') {
//    msg.option.color = 'black';
//  }
//  objects.push(msg);
//
//  return msg;
//}
//
function onDisconnect(client)
{
  msg  = {"data"      : client. sessionId+"が切断されました",
          "type"      : ACTION_TYPE.STGING,
          "option"    : {"color" : "red"},
          "createdAt" : nowDate()} ;
}
//
function onMessage(msg, client)
{
//  switch (msg.action) {
//  case ACTION_TYPE.REQUEST_CREATE:
//    var obj = {"id"       : objects.length + 1,
//               "action"   : ACTION_TYPE.CREATE,
//               "type"     : msg.type,
//               "status"   : '',
//               "clientId" : client. sessionId};
//    objects.push(obj);
//    client.send(obj);
//    break;
//  case ACTION_TYPE.REQUEST_LOCK:
//    // fix me
//    var obj = {"action" : ACTION_TYPE.LOCK,
//               "id"     : msg.id};
//    break;
//  case ACTION_TYPE.REQUEST_EDIT:
//    var obj = {"action": ACTION_TYPE.EDIT,
//               "attr"  : msg.attr,
//               "id"    : msg.id};
//    break;
//  }
//  client.broadcast(obj);
}
//
function nowDate()
{
  d = new Date();
  return  d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate()+ " "+ d.getHours()+':' +d.getMinutes()+':' + d.getSeconds();
}
//*/
////}}}
function exitWithError(err)
{
  console.log(err);
  process.exit(0);
}
