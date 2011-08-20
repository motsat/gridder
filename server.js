var socketIO = require('socket.io'),
    express  = require('express'),
    objects  = [],
    mongoose = require('mongoose'),
    schemas  = require('./mongoschema').schemas(),
    app      = express.createServer();
    io       = socketIO.listen(app);

app.configure(function() {
    app.set('views', __dirname + '/views')
       .use(express.static(__dirname + '/public'))
       .set("view options", { layout: false })
       .get('/', function(req, res) {
         res.render('index.ejs');
       })
});
app.listen(80);

mongoose.connect('mongodb://localhost/gridder', onMongoConnected);
for (var i=0; i < schemas.length; i++) {
  mongoose.model(schemas[i].name, schemas[i].schema);
}

var Task = mongoose.model('Task');

io.sockets.on('connection', function(client) {
  sendSavedTask(client);
  client.on('message', function(msg) {
    var instance = new Task(a);
    instance.save(function (err) {
      console.log(err || 'saved');
    });

    // var id = msg._id;
    // delete(msg._id);
    // Task.update({_id:id}, msg ,function(err) {
    //      console.log(err || 'saved');
    // });
  }
  );
  client.on('disconnect', function() {onDisconnect(client)});
});

function sendSavedTask(client)
{
  var tmpID  = '4e489a993bee7c524a000001';
  var myTask = Task.findOne({ '_id': tmpID}, function (err, doc){
    if (err) {
      exitWithError(err);
    }
    doc = {"parent":[],"child":[],"end_title":"外部公開","tasks":[{"title":"設計","description":"・デザイン\n・プロトタイプ\n","tasks":[{"title":"nontitleaa","tasks":[]}]}],"title":"このアプリ完成まで","_id":"4e489a993bee7c524a000001"} 
    
    
    
    
    
    
    
    
    client.json.send(doc);
  });

}
function onDisconnect(client)
{
}
function onMongoConnected(err)
{
  if (err) {
    exitWithError(err);
  } else {
    console.log('mongo connect success');
  }
}
function nowDate()
{
  var d = new Date();
  return  d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate()+ " "+ d.getHours()+':' +d.getMinutes()+':' + d.getSeconds();
}

function exitWithError(err)
{
  console.log(err);
  process.exit(0);
}
