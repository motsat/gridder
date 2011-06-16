require('mongoose');
var mongo  = require('mongoose');
var Schema = mongo.Schema;

// ModelのSchema Class定義する
var TaskSchema = new Schema({
  title       : String,
  is_complete : Boolean
});

TaskSchema.add({
  parent : [TaskSchema],
  child  : [TaskSchema]});


// ModelのSchema Class定義する
var StorySchema = new Schema({
  title : String,
  tasks : [TaskSchema]
});

exports.schemas = function() {
  return [{name   : 'Task',
           schema : TaskSchema},
          {name   : 'Task',
           schema : TaskSchema}] 
}
