// 以下の仲介役
// task
// parentTaskの設定で文字いれないと、childTaskが変な場所になる
//
TaskRenderer = function(config, raphael, mediator) {
    this.v        = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderBase = function(str, x, y, attr, editOptions) {
   var v              = this.v,
       rect           = this.raphael.rect(x, y, w = v.rectEnd.w, y2 = v.rectEnd.h, v.taskR)
                        .attr($.extend(attr, {'scale':0.1})),
       text           = this.raphael.text(x + v.font_m.padding_rect.x, y + v.font_m.padding_rect.y, str).
                        attr(v.font_m.attr),
       onEndAnimation = null,
       mediator       = this.mediator,
       sets           = this.raphael.set().push(rect, text);

   if (editOptions && editOptions.openOnCraeted) {
      onEndAnimation = function() {mediator.showEditBox(editOptions.task, sets)};
   }

   rect.animate({'scale':1}, 400, 'bounce', onEndAnimation)
       .node.style.cursor = 'pointer';
   text.node.style.cursor = 'pointer';

   return sets;

}
TaskRenderer.prototype.renderStart = function(x) {
   var v = this.v;
   return this.renderBase('スタート' , x, y = v.paper.margin.h, v.rectStart.attr);
}

TaskRenderer.prototype.renderEnd = function(x, task) {
   var v = this.v;
   return this.renderBase(task.end_title, x, y = v.paper.margin.h, v.rectEnd.attr);
}

TaskRenderer.prototype.renderParentTask = function(x, y, parentTask, mediator, openOnCraeted){
  var sets   = this.renderBase(parentTask.title, x, y, v.rectP.attr, {openOnCraeted:openOnCraeted, task:parentTask}),
      addImg = this.raphael.image('/images/plus.png', x , y + (v.rectP.h / 2)+10, w = v.icon.w, h = v.icon.h)
               .click(function() {mediator.addChildTask(sets, {'title':''}, parentTask)});

  sets.click(function(){mediator.showEditBox(parentTask, sets)});
  sets.push(addImg);

  var showIcons = function() {addImg.show();},
      hideIcons = function() {addImg.hide();};
  return sets;
}

TaskRenderer.prototype.renderChildTask2 = function(parentNum, childNum,  mediator) {

  // fix me
  var openOnCraeted = false;
  
  var parentTask      = mediator.objects.tasks[parentNum],
      parentShapes    = mediator.shapes.tasks[parentNum].parent;
      childTask       = parentTask.tasks[childNum],
      v               = mediator.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = parentShapes.getBBox().x + v.taskMargin.child.w,
      y               = parentShapes.getBBox().y + ((childNum+1) * (v.rectP.h + v.taskMargin.child.h)),
      chilsSets       = this.renderBase(childTask.title, x, y, v.rectC.attr, {openOnCraeted:openOnCraeted, task:childTask}),
      path            = this.raphael.path($.sprintf('"M %d %d  L %d %d', x, y - v.taskMargin.child.h,  x, y + v.rectC.h)) 
                         .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
                         .animate({'scale':1}, 100)
                         .toBack();
  chilsSets.push(path);

  chilsSets.click(function(){mediator.showEditBox(parentTask.tasks[childNum], chilsSets)});

  var order = mediator.getParentSortNumber(parentTask);
  mediator.shapes.tasks[order].childs.push(chilsSets);

  return chilsSets;
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
   this.shapes       = {'start_task':[], 'tasks':[], 'end_task':[]};
   var nextX         = v.paper.margin.w;

   var saveEditBox = function () {
     log('execute saveEditbox');
     $.each(mediator.editingTask.shapes , function(idx, elm) {
       if (elm.type == 'text') {
         log('--set text');
         elm.attr({text:$('#task_title').val()});
       }
     });
     mediator.editingTask.task.title = $('#task_title').val();
     log('task data save');
     $('#editbox').dialog('close');
   };

   // setup editBox
   var onEnterKeyDown = function (evt){
     if (evt.keyCode =='13') {
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
   log('execute dispatchMessage!');
   this.objects = msg;
   var mediator = this,
       nextX    = v.paper.margin.w;

   this.editingTask = {task:null, shapes:null};
   this.taskRenderer.renderStart(nextX);

   nextX += (v.rectStart.w + v.taskMargin.w);
   var parentSets = [];
   for (var i=0; i < this.objects.tasks.length; i++) {
     var parentTask  = this.objects.tasks[i],
         childShapes = [];

     // render parentTask
     parentSets[i] = this.taskRenderer.renderParentTask(nextX, v.paper.margin.h, parentTask, this, false);
     pushArrayAt(this.shapes.tasks, i, {parent:parentSets[i], childs:[]});

     if (parentTask.tasks){
       var childTasks  = parentTask.tasks,
           childLength = childTasks.length;
       for (var n = 0; n < childLength; n++) {
         var parentNum = i,
             childNum  = n;
         this.taskRenderer.renderChildTask2(parentNum, childNum,  mediator);
        }
     }
     nextX += (v.rectP.w + v.taskMargin.w);
   }

   this.shapes.end_task = this.taskRenderer.renderEnd(nextX,this.objects);
   this.taskRenderer.renderPath(nextX, mediator)
                    .click(function(evt){mediator.onClickPath(evt)});

}
ObjectMediator.prototype.onSaveTasks = function()
{
  this.socket.send(this.objects);
}
ObjectMediator.prototype.addChildTask = function(parentShapes, childTask, parentTask)
{
  log('execute addChildTask!');
  // fix me
  // pos系統とかをrenderChildTaskにおとしこむ？
  var v               = this.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = parentShapes.getBBox().x + v.taskMargin.child.w,
      y               = parentShapes.getBBox().y + ((parentTask.tasks.length + 1) * (v.rectP.h + v.taskMargin.child.h));

  parentTask.tasks.push(childTask);
  var parentNum = this.getParentSortNumber(parentTask),
      childNum  = parentTask.tasks.length - 1;
  this.taskRenderer.renderChildTask2(parentNum, childNum, this);
}
ObjectMediator.prototype.addParentTask = function(x)
{
   log('execute addParentTask!');
  var v         = this.config.visual,
      num       = this.taskNumAtPathX(x),
      newTask   = {title:'', tasks:[]},
      taskShape = this.taskRenderer.renderParentTask(this.calculateTaskX(num) , v.paper.margin.h, newTask, this, true);
  pushArrayAt(this.objects.tasks, num, newTask);
  pushArrayAt(this.shapes.tasks,  num, {parent:taskShape, childs:[]});
  this.moveTaskShapesAt(num + 1); // 追加分以降のものを移動
}
ObjectMediator.prototype.calculateTaskX = function(num)
{
  var v               = this.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w;
  return v.paper.margin.w + startTaskMargin + (num * (v.rectP.w + v.taskMargin.w));

}
ObjectMediator.prototype.moveRaphaelSets = function(sets, x) {
  log('execute moveRaphaelSets!');
  for (var n = 0; n < sets.items.length; n++){
    // fix me
    log(sets.attr({"stroke":"darkblue"}));

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
  log('execute moveTaskShapesAt!');
  var parentShapes = this.shapes.tasks,
      v            = this.config.visual;
  this.moveRaphaelSets(this.shapes.end_task, v.rectP.w + v.taskMargin.w );

  if (parentShapes.length <= 0 ) {
    return;
  }

  for (var i = num; i < parentShapes.length; i++) {
    this.moveRaphaelSets(parentShapes[i].parent, v.rectP.w + v.taskMargin.w );
    if (0 < parentShapes[i].childs.length) {
      var childs       = parentShapes[i].childs,
          childsLength = childs.length;
      for (var z = 0; z < childsLength; z++) {
        this.moveRaphaelSets(childs[z], v.rectP.w + v.taskMargin.w);
      }
    }
  }
}

ObjectMediator.prototype.onClickPath = function(evt) {
  log('execute onClickPath!');
  this.addParentTask(evt.x);
}
ObjectMediator.prototype.taskNumAtPathX = function(pathX) {
  log('execute taskNumAtPathX!');
  // 計算式が適当なので詳細詰め
  var v = this.config.visual;
  return parseInt(pathX / (v.taskMargin.w + v.rectP.w))-1;
}

ObjectMediator.prototype.showEditBox = function(task, shapes) {
  log('execute showEditBox!');
  mediator.editingTask = {task:task, shapes:shapes};
  $('#task_id').val(task.__id);
  $('#task_title').val(task.title);
  $('#task_description').val(task.description);
  $('#editbox').dialog( { draggable: true });

}
ObjectMediator.prototype.getParentSortNumber = function(parentTask) {
  log('execute getParentSortNumber!');
  var length = this.objects.tasks.length;
  for (var i=0; i < length; i++) {
      if (this.objects.tasks[i] === parentTask) {
        return i;
      }
  }
  throw 'getParentSortNumber is null';
}
