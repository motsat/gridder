// 以下の仲介役
// task
// parentTaskの設定で文字いれないと、childTaskが変な場所になる
//
TaskRenderer = function(config, raphael, mediator) {
    this.v        = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderBase = function(task, x, y, attr, editOptions) {
   var v              = this.v,
       rect           = this.raphael.rect(x, y, w = v.rectEnd.w, y2 = v.rectEnd.h, v.taskR)
                        .attr($.extend(attr, {'scale':0.1})),
       text           = this.raphael.text(x + v.font_m.padding_rect.x, y + v.font_m.padding_rect.y, task.title).
                        attr(v.font_m.attr),
       onEndAnimation = function() {},
       mediator       = this.mediator,
       sets           = this.raphael.set().push(rect, text);

   if (editOptions && editOptions.openOnCraeted) {
      onEndAnimation = function() {mediator.showEditBox(task)};
   }

   rect.animate({'scale':1}, 400, 'bounce', onEndAnimation)
       .node.style.cursor = 'pointer';
   text.node.style.cursor = 'pointer';

   return sets;

}
TaskRenderer.prototype.renderStart = function(x) {
   var v = this.v;
   return this.renderBase({title:'スタート'} , x, y = v.paper.margin.h, v.rectStart.attr);
}

TaskRenderer.prototype.renderEnd = function(x, task) {
   var v = this.v;
   return this.renderBase(task, x, y = v.paper.margin.h, v.rectEnd.attr);
}

TaskRenderer.prototype.renderParentTask = function(x, y, parentTask, mediator, openOnCraeted){

  var shapes = this.renderBase(parentTask, x, y, v.rectP.attr, {openOnCraeted:openOnCraeted}),
      addImg = this.raphael.image('/images/plus.png', x , y + (v.rectP.h / 2)+10, w = v.icon.w, h = v.icon.h)
                   .click(function() {mediator.addChildTask({'title':'', 'key':getTaskKey()}, parentTask)});

  shapes.click(function(){mediator.showEditBox(parentTask)});
  shapes.push(addImg);

  parentTask.shapes = shapes;

  var showIcons = function() {addImg.show();},
      hideIcons = function() {addImg.hide();};
  return shapes;
}

TaskRenderer.prototype.renderChildTask = function(parentNum, childNum,  options) {
  // fix me
  // getParentPos
  var parentShapes  = mediator.objects.tasks[parentNum].shapes,
      parentPos     = {x:parentShapes.getBBox().x, y:parentShapes.getBBox().y};

  var openOnCraeted   = options && options.openOnCraeted,
      parentTask      = this.mediator.objects.tasks[parentNum],
      childTask       = parentTask.tasks[childNum],
      v               = this.mediator.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = parentPos.x + v.taskMargin.child.w,
      y               = parentPos.y + ((childNum+1) * (v.rectP.h + v.taskMargin.child.h)),
      childSets       = this.renderBase(childTask, x, y, v.rectC.attr, {openOnCraeted:openOnCraeted}),
      path            = this.raphael.path($.sprintf('"M %d %d  L %d %d', x, y - v.taskMargin.child.h,  x, y + v.rectC.h)) 
                         .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
                         .animate({'scale':1}, 100)
                         .toBack();
      childSets.push(path);

      childTask.shapes = childSets;

  childSets.click(function() {mediator.showEditBox(childTask)});

  return childSets;
}
TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.paper.margin.h + (v.rectStart.h / 2);

  return this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.paper.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate( {'scale':1}, 300)
              .toBack();
}
ObjectMediator = function() {};
ObjectMediator.prototype.setUp = function(config) {
  var socket   = new io.connect(config.server_host,{port:config.port});//.connect(),
       v        = config.visual,
       raphael  = Raphael(document.getElementById(config.paper_id), v.paper.w, v.paper.h),
       mediator = this;
   socket.on('message', function(msg) {
     mediator.dispatchMessage(msg)
   });

   this.socket       = socket;
   this.taskRenderer = new TaskRenderer(config, raphael, this);
   this.config       = config;
   var nextX         = v.paper.margin.w;

   var saveEditBox = function () {
     $.each(mediator.editingTask.shapes , function(idx, elm) {
       if (elm.type == 'text') {
         elm.attr({text:$('#task_title').val()});
       }
     });
     mediator.editingTask.task.title = $('#task_title').val();
     $('#editbox').dialog('close');
   };

   // setup editBox
   var onEnterKeyDown = function (evt){
     if (evt.keyCode == '13') {
       saveEditBox();
     }
  };

  $('#edit_complete').click(saveEditBox);
  $('#task_title').keydown(onEnterKeyDown);
  $('#editbox').hide();

  // save_button
  $('#save_button').click(function (evt) {mediator.onSaveTasks()});

};
ObjectMediator.prototype.dispatchMessage = function(msg){
   this.objects = msg;
   var mediator = this,
       nextX    = v.paper.margin.w;

   this.editingTask = {task:null, shapes:null};
   this.objects.startTask = {shapes:null, title:''};
   this.objects.startTask.shapes = this.taskRenderer.renderStart(nextX);

   nextX += (v.rectStart.w + v.taskMargin.w);
   var parentSets = [];
   for (var parentNum = 0; parentNum < this.objects.tasks.length; parentNum++) {
     var parentTask  = this.objects.tasks[parentNum];

     this.taskRenderer.renderParentTask(nextX, v.paper.margin.h, parentTask, this, false);

     if (parentTask.tasks){
       var childTasks  = parentTask.tasks,
           childLength = childTasks.length;
       for (var childNum = 0; childNum < childLength; childNum++) {
         this.taskRenderer.renderChildTask(parentNum, childNum);
        }
     }
     nextX += (v.rectP.w + v.taskMargin.w);
   }
   this.objects.endTask = {shapes:null, title:this.objects.end_title};
   this.objects.endTask.shapes = this.taskRenderer.renderEnd(nextX, this.objects.endTask);
   this.taskRenderer.renderPath(nextX, mediator)
                    .click(function(evt){mediator.onClickPath(evt)});

}
ObjectMediator.prototype.onSaveTasks = function()
{
  this.socket.send(this.objects);
}
ObjectMediator.prototype.addChildTask = function(/*parentShapes, */childTask, parentTask)
{
  // fix me
  // pos系統とかをrenderChildTaskにおとしこむ？
  var v               = this.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = parentTask.shapes.getBBox().x + v.taskMargin.child.w,
      y               = parentTask.shapes.getBBox().y + ((parentTask.tasks.length + 1) * (v.rectP.h + v.taskMargin.child.h));

  parentTask.tasks.push(childTask);
  var parentNum = this.getParentSortNumber(parentTask),
      childNum  = parentTask.tasks.length - 1;

  this.taskRenderer.renderChildTask(parentNum, childNum, {openOnCraeted:true});
}
ObjectMediator.prototype.addParentTask = function(x)
{
  var v         = this.config.visual,
      num       = this.taskNumAtPathX(x),
      newTask   = {title:'', tasks:[], key:getTaskKey()},
      taskShape = this.taskRenderer.renderParentTask(this.calculateTaskX(num) , v.paper.margin.h, newTask, this, true);
  newTask.shapes = taskShape;

  this.objects.tasks.splice(num, 0, newTask);
  var addTaskNum = num + 1;
  if (addTaskNum  < this.objects.tasks.length) {
    this.moveTaskShapesAt(addTaskNum); // 追加分以降のものを移動
  }
  this.moveRaphaelSets(this.objects.endTask.shapes, v.rectP.w + v.taskMargin.w );
}
ObjectMediator.prototype.calculateTaskX = function(num)
{
  var v               = this.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w;
  return v.paper.margin.w + startTaskMargin + (num * (v.rectP.w + v.taskMargin.w));

}
ObjectMediator.prototype.moveRaphaelSets = function(sets, x) {
  for (var n = 0; n < sets.items.length; n++){
    var item  = sets.items[n];
    if (item.type == 'path') {
      path = $.extend(true, [], item.attr('path')); // deep copy
      path[0][1] += v.rectP.w + v.taskMargin.w;
      path[1][1] += v.rectP.w + v.taskMargin.w;
      item.animate({'path':pathToString(path)}, 500);
    }
    var x = item.getBBox().x;
    item.animate( {'x': x + v.rectP.w + v.taskMargin.w}, 500);
  }
}

ObjectMediator.prototype.moveTaskShapesAt = function(num) 
{
   var allParentTasks  = this.objects.tasks,
       v               = this.config.visual;

  if (allParentTasks.length <= 0 ) {
    return;
  }

  for (var i = num; i < allParentTasks.length; i++) {
    var parentTask =  allParentTasks[i];
    this.moveRaphaelSets(parentTask.shapes, v.rectP.w + v.taskMargin.w );
    if (0 < parentTask.tasks.length) {
      for (var z = 0; z < parentTask.tasks.length; z++) {
        this.moveRaphaelSets(parentTask.tasks[z].shapes, v.rectP.w + v.taskMargin.w);
      }
    }
  }
}

ObjectMediator.prototype.onClickPath = function(evt) {
  this.addParentTask(evt.x);
}
ObjectMediator.prototype.taskNumAtPathX = function(pathX) {
  // 計算式が適当なので詳細詰め
  var v = this.config.visual;
  return parseInt(pathX / (v.taskMargin.w + v.rectP.w))-1;
}

ObjectMediator.prototype.showEditBox = function(targetTask) {
  log(targetTask); 
  this.editingTask = {task:targetTask, shapes:targetTask.shapes};
  $('#task_id').val(targetTask.__id);
  $('#task_title').val(targetTask.title);
  $('#task_description').val(targetTask.description);
  $('#editbox').dialog( { draggable: true });

}
ObjectMediator.prototype.getParentSortNumber = function(parentTask) {
  var length = this.objects.tasks.length;
  for (var i=0; i < length; i++) {
      if (this.objects.tasks[i] === parentTask) {
        return i;
      }
  }
  throw 'getParentSortNumber is null';
}
function getTaskKey()
{
  return CybozuLabs.MD5.calc(Math.random());
}
