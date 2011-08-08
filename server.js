var io       = require('socket.io'),
    express  = require('express'),
    objects  = [],
    mongoose = require('mongoose'),
    schemas  = require('./mongoschema').schemas(),
    app      = express.createServer();

app.configure(function() {
    app.set('views', __dirname + '/views')
       .use(express.static(__dirname + '/public'))
       .set("view options", { layout: false })
       .get('/', function(req, res) {
         res.render('index.ejs');
       })
});
app.listen(8000);

mongoose.connect('mongodb://localhost/gridder',
  function (err) {
    if (err) {
      exitWithError(err);
    }
  }
);
for (var i=0; i < schemas.length; i++) {
  mongoose.model(schemas[i].name, schemas[i].schema);
}
var Task = mongoose.model('Task'),
    socket = io.listen(app);

socket.on('connection', function(client) {
  sendSavedTask(client);
  client.on('message', function(msg) {
    var task = new Task(msg);
    task.save(function(err) {
        console.log(err || 'saved');
      });
  }
  );
  client.on('disconnect', function() {onDisconnect(client)});
});

function sendSavedTask(client)
{
  var tmpID  = '4e39f035b966906c0e000001';
  console.log(Task);
  var myTask = Task.findOne({ '_id': tmpID}, function (err, doc){
    if (err) {
      exitWithError(err);
    }
      console.log(doc);
      client.send(doc);
    });

}
function onDisconnect(client)
{
}
function onMessage(msg, client)
{
  console.log(msg.tasks);
}
function nowDate()
{
  d = new Date();
  return  d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate()+ " "+ d.getHours()+':' +d.getMinutes()+':' + d.getSeconds();
}
function exitWithError(err)
{
  console.log(err);
  process.exit(0);
}
