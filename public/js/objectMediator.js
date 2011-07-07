// 以下の仲介役
TaskRenderer = function(config, raphael, mediator) 
{
    this.o  = config.objects;
    this.v  = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderTaskBase = function(str, x, y, attr, editOptions)
{
   var v              = this.v,
       rc             = this.raphael.rect(x, y, w = v.rectEnd.w, y2 = v.rectEnd.h, v.taskR)
                        .attr($.extend(attr, {'scale':0.1})),
       tx             = this.raphael.text(x + v.font_m.padding_rect.x,
                        y + v.font_m.padding_rect.y, str).
                        attr(v.font_m.attr),
       onEndAnimation = null;
       mediator       = this.mediator;
   s =  this.raphael.set().push(rc, tx);

   if (editOptions && editOptions.openOnCraeted) {
      onEndAnimation = function() {mediator.showEditBox(editOptions.task, s)};
   } else {
      onEndAnimation = null;
   }

   rc.animate({'scale':1}, 400, 'bounce', onEndAnimation);
   rc.node.style.cursor = 'pointer';
   tx.node.style.cursor = 'pointer';
   return s;

}
TaskRenderer.prototype.renderStart = function(x) {
   var v = this.v;
   return this.renderTaskBase('スタート' , x, y = v.paper.margin.h, v.rectStart.attr);
}

TaskRenderer.prototype.renderEnd = function(x, task) {
   var v = this.v;
   return this.renderTaskBase(task.end_title, x, y = v.paper.margin.h, v.rectEnd.attr);
}

TaskRenderer.prototype.renderTaskParent = function(x, y, task, mediator, openOnCraeted){
  var s      = this.renderTaskBase(task.title, x, y, v.rectP.attr, {openOnCraeted:openOnCraeted, task:task}),
      addImg = this.raphael.image('/images/plus.png', x , y + (v.rectP.h / 2)+10, w = v.icon.w, h = v.icon.h)
               .click(function() {mediator.addChildTask(task, s)});

  s.click(function(){mediator.showEditBox(task, s)});
  s.push(addImg);

  var showIcons   = function() {addImg.show();},
      hideIcons   = function() {addImg.hide();};
  return s;
}

TaskRenderer.prototype.renderTaskChild = function(x, y, task, mediator){
  var s      = this.renderTaskBase(task.title, x, y, v.rectC.attr, {openOnCraeted:true, task:task}),
      p      = this.raphael.path($.sprintf('"M %d %d  L %d %d', x, y - v.taskMargin.child.h,  x, y + v.rectC.h)) 
                   .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
                   .animate( {'scale':1}, 100)
                   .toBack();
  s.push(p);
  s.click(function(){mediator.showEditBox(task, s)});
  return s;
}

TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.paper.margin.h + (v.rectStart.h / 2);

  return this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.paper.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate( {'scale':1}, 300)
              .toBack();
}


ObjectMediator = function() {};
ObjectMediator.prototype.setUp = function(config, objects) {
   var socket       = new io.Socket(config.server_host,{port:config.port}),
       v            = config.visual,
       raphael      = Raphael(document.getElementById(config.paper_id),
                      v.paper.w, v.paper.h);

   this.taskRenderer = new TaskRenderer(config, raphael, this);
   this.config       = config;
   this.objects      = objects;
   this.shapes       = {'start_task' : [],
                        'tasks'      : [],
                        'end_task'   : []};
   var mediator = this,
       nextX    = v.paper.margin.w;

   this.editingTask = {task:null, shapes:null};

   this.taskRenderer.renderStart(nextX);

   nextX += (v.rectStart.w + v.taskMargin.w);
   var sets = [];
   for (var i=0; i < objects.tasks.length; i++) {
     sets[i] = this.taskRenderer.renderTaskParent(nextX, v.paper.margin.h, objects.tasks[i], this, false)     ;
     pushArrayAt(this.shapes.tasks, i, {parent:sets[i], childs:[]});
     nextX += (v.rectP.w + v.taskMargin.w);
   }

   this.shapes.end_task = this.taskRenderer.renderEnd(nextX,objects);
   this.taskRenderer.renderPath(nextX, mediator)
                    .click(function(evt){mediator.onClickPath(evt)});
   var saveEditBox = function () {
     $('#editbox').dialog('close');
   };
  // setup editBox
  var onEnterKeyDown = function (evt){
      if (evt.keyCode =='13') {
        $.each(mediator.editingTask.shapes , function(idx, elm) {
            if (elm.type == 'text') {
              elm.attr({text:$('#task_title').val()});
            }
        });
        mediator.editingTask.task.title = $('#task_title').val();
        saveEditBox();
      }
  };
  $('#edit_complete').click(saveEditBox);
  $('#task_title').keydown(onEnterKeyDown);
  $('#editbox').hide();
};

ObjectMediator.prototype.addChildTask = function(task, shapes)
{
  var v               = this.config.visual,
      newTask         = {title:'non title', tasks:[]},
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = shapes.getBBox().x + v.taskMargin.child.w,
      y               = shapes.getBBox().y + ((task.tasks.length + 1) * (v.rectP.h + v.taskMargin.child.h)),
      taskShape       = this.taskRenderer.renderTaskChild(x,y, newTask, this);

  task.tasks.push(newTask);
  var order = this.orderOfParentTask(task);
  this.shapes.tasks[order].childs.push(taskShape);
}
ObjectMediator.prototype.addParentTask = function(x)
{
  var v               = this.config.visual,
      num             = this.taskNumAtPathX(x),
      newTask         = {title:'non title', tasks:[]},
      taskShape       = this.taskRenderer.renderTaskParent(this.calculateTaskX(num) , v.paper.margin.h, newTask, this, true);
  //this.objects.tasks  = pushArrayAt(this.objects.tasks, num, newTask);
  //this.shapes.tasks   = pushArrayAt(this.shapes.tasks,  num, taskShape);
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
  var tasks = this.shapes.tasks,
      v     = this.config.visual;
  this.moveRaphaelSets(this.shapes.end_task, v.rectP.w + v.taskMargin.w );

  if (tasks.length <= 0 ) {
    return;
  }

  for (var i = num; i < tasks.length; i++) {
    this.moveRaphaelSets(tasks[i].parent, v.rectP.w + v.taskMargin.w );
    if (0 < tasks[i].childs.length){
      var childs = tasks[i].childs;
      log(1);
      for (var z = 0; z < childs.length; z++) {
      log(2);
        this.moveRaphaelSets(childs[z], v.rectP.w + v.taskMargin.w );
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

ObjectMediator.prototype.showEditBox = function(task, shapes) {
  mediator.editingTask = {task:task, shapes:shapes};
  $('#task_id').val(task.__id);
  $('#task_title').val(task.title);
  $('#task_description').val(task.description);
  $('#editbox').dialog( { draggable: true });

}
ObjectMediator.prototype.orderOfParentTask = function(task) {
  for (var i=0;i < this.objects.tasks.length; i++) {
      if (this.objects.tasks[i] === task){
        return i;
      }
  }
}
