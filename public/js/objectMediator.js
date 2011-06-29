// 以下の仲介役
TaskRenderer = function(config, raphael, mediator) 
{
    this.o  = config.objects;
    this.v  = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderTaskBase = function(str, x, y, attr)
{
   var v  = this.v,
       rc = this.raphael.rect(x, y, w = v.rectEnd.w, y2 = v.rectEnd.h, v.taskR)
                      .attr($.extend(attr, {'scale':0.1}))
                      .animate( {'scale':1}, 700, 'bounce');
       tx = this.raphael.text(x + v.font_m.padding_rect.x,
                              y + v.font_m.padding_rect.y, str).
                              attr(v.font_m.attr);
   rc.node.style.cursor = 'pointer';
   tx.node.style.cursor = 'pointer';
   return this.raphael.set().push(rc, tx);

}
TaskRenderer.prototype.renderStart = function(x){
   var v = this.v;
   return this.renderTaskBase('スタート' , x, y = v.paper.margin.h, v.rectStart.attr);
}
TaskRenderer.prototype.renderEnd = function(x, task){
   var v = this.v;
   return this.renderTaskBase(task.end_title, x, y = v.paper.margin.h, v.rectEnd.attr);
}
TaskRenderer.prototype.renderTask = function(x, y, task, mediator){
  var s      = this.renderTaskBase(task.title,x, y, v.rectL.attr)
               .click(function(){showEditBox()}),
      addImg = this.raphael.image('/images/plus.png', x , v.rectL.h, w = v.icon.w, h = v.icon.h)
               .click(function() {mediator.addChildTask(task, s)});

  s.push(addImg);

  var showIcons   = function() {addImg.show();},
      hideIcons   = function() {addImg.hide();},
      showEditBox = function() {
        mediator.editingTask = {task:task, shapes:s};
        $('#task_id').val(task.__id);
        $('#task_title').val(task.title);
        $('#task_description').val(task.description);
        $('#editbox').dialog( { draggable: true });
      };
  return s;
}

TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.paper.margin.h + (v.rectStart.h / 2);

  return this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.paper.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate( {'scale':1}, 800)
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

   for (var i=0; i < objects.tasks.length; i++) {
     this.shapes.tasks = pushArrayAt(this.shapes.tasks, i,
                                     this.taskRenderer.renderTask(nextX, v.paper.margin.h, objects.tasks[i], this));
     nextX += (v.rectL.w + v.taskMargin.w);
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
      newTask         = {title:'non title(child)'},
      startTaskMargin = v.rectStart.w + v.taskMargin.w,
      x               = shapes.getBBox().x,
      y               = shapes.getBBox().y + v.rectL.h + v.taskMargin.h,
      taskShape       = this.taskRenderer.renderTask(x, y, newTask, this);

  task.tasks.push(newTask);
  // this.moveTaskShapesAt(num + 1); // 追加分以降のものを移動

}
ObjectMediator.prototype.addParentTask = function(x)
{
  var v               = this.config.visual,
      num             = this.taskNumAtPathX(x),
      newTask         = {title:'non title'},
      taskShape       = this.taskRenderer.renderTask(this.calculateTaskX(num) , v.paper.margin.h, newTask, this);
  this.objects.tasks  = pushArrayAt(this.objects.tasks, num, newTask);
  this.shapes.tasks   = pushArrayAt(this.shapes.tasks,  num, taskShape);

  this.moveTaskShapesAt(num + 1); // 追加分以降のものを移動
}
ObjectMediator.prototype.calculateTaskX = function(num)
{
  var v               = this.config.visual,
      startTaskMargin = v.rectStart.w + v.taskMargin.w;
  return v.paper.margin.w + startTaskMargin + (num * (v.rectL.w + v.taskMargin.w));

}
ObjectMediator.prototype.moveRaphaelSets = function(sets, x) {

  for (var n = 0; n < sets.items.length; n++){
    var item  = sets.items[n];
    var x = item.getBBox().x;
    item.animate( {'x': x + v.rectL.w + v.taskMargin.w}, 500);
  }

}

ObjectMediator.prototype.moveTaskShapesAt = function(num) 
{
  var tasks = this.shapes.tasks,
      v     = this.config.visual;

  this.moveRaphaelSets(this.shapes.end_task, v.rectL.w + v.taskMargin.w );

  if (tasks.length <= 0 ) {
    return;
  }

  for (var i = num; i < tasks.length; i++) {
    this.moveRaphaelSets(tasks[i], v.rectL.w + v.taskMargin.w );
  }
}

ObjectMediator.prototype.onClickPath = function(evt) {
  this.addParentTask(evt.x);
}
ObjectMediator.prototype.taskNumAtPathX = function(pathX) {
  // 計算式が適当なので詳細詰め
  var v = this.config.visual;
  return parseInt(pathX / (v.taskMargin.w + v.rectL.w))-1;
}
