console.log('start');
var mongoose = require('mongoose'),
    schemas  = require('./mongoschema').schemas();

for (var i=0; i < schemas.length; i++) {
  mongoose.model(schemas[i].name, schemas[i].schema);
}

// sudo /usr/local/mongo/bin/mongod
mongoose.connect('mongodb://localhost/gridder',
  function (err) {
    if (err) {
      exitWithError(err);
    }
  }
);

var tasks  = [ { __id: '1-1',
    title: '設計',
    description: '・デザイン\n・プロトタイプ\n',
    tasks: [] },
  { __id: '1-2',
    title: '大項目2',
    tasks: [  ]}];



// mongodb://[hostname]/[dbname]
////// インスタンス生成
var task = new Task(
{ title       : 'hoge title',
  is_complete : false,
  parent      : []
}
)


function exitWithError(err)
{
  console.log(err);
  process.exit(0);
};
