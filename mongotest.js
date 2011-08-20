var mongoose = require('mongoose'),
    schemas  = require('./mongoschema').schemas();

mongoose.connect('mongodb://localhost/gridder', onMongoConnected);
for (var i=0; i < schemas.length; i++) {
  mongoose.model(schemas[i].name, schemas[i].schema);
}

var Task = mongoose.model('Task');

  var tmpID  = '4e489a993bee7c524a000001';
  Task.findOne({ '_id': tmpID}, function (err, doc){
    if (err) {
      exitWithError(err);
    }
    console.log(doc.toJSON().tasks);
  });
function onMongoConnected(err)
{
  if (err) {
    exitWithError(err);
  } else {
    console.log('mongo connect success');
  }
}
function exitWithError(err)
{
  console.log(err);
  process.exit(0);
}
