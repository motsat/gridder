// 以下の仲介役
TaskRenderer = function(config, raphael, mediator) 
{
    this.o  = config.objects;
    this.v  = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderStart = function(x){

  var start_rect = this.raphael.rect(x, y=this.v.paper.margin.h, w= this.v.rectStart.w, 
                                     y2= this.v.rectStart.h, this.v.taskR)
                                .attr($.extend(this.v.rectStart.attr, {'scale':0.1}))
                                .animate({'scale':1}, 700, 'bounce');

  start_rect.click(this.mediator.onTaskClick);

  var bBox  = start_rect.getBBox(),
      tx    = this.raphael.text(bBox.x, bBox.y, 'スタート').
              attr(this.v.font_m.attr);
}


TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.paper.margin.h + (v.rectStart.h / 2);

  return this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.paper.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate({'scale':1}, 800)
              .toBack();
}

TaskRenderer.prototype.renderGoal = function(x, task){
   var goal_rect  = this.raphael.rect(x, y = this.v.paper.margin.h, w = this.v.rectEnd.w, y2 = this.v.rectEnd.h, this.v.taskR)
                        .attr($.extend(this.v.rectEnd.attr, {'scale':0.1}))
                        .animate({'scale':1}, 700, 'bounce'),
       bBox       = goal_rect.getBBox(),
       tx         = this.raphael.text(bBox.x, bBox.y, task.goal_title).
                    attr(this.v.font_m.attr);
}

TaskRenderer.prototype.renderTask = function(x, task, mediator){
  var rc = this.raphael.rect(x, y= v.paper.margin.h, w = v.rectL.w, h=v.rectL.h, v.taskR)
               .attr($.extend(v.rectL.attr, {'scale':0.1}))
               .animate({'scale':1}, 700, 'bounce')
               .mouseover(function() {showIcons()})
               .mouseout(function() {hideIcons()});

  var editImg = this.raphael.image('/images/pencil.gif', x, y =  v.paper.margin.h, w = v.icon.w, h = v.icon.h)
          .hide()
          .mouseover(function() {showIcons()})
          .mouseout(function() {hideIcons()})
          .click(function() {mediator.onClickEditTask(task)});

  var addImg = this.raphael.image('/images/plus.png', x + v.icon.margin , y =  v.paper.margin.h, w = v.icon.w, h = v.icon.h)
          .hide()
          .mouseover(function() {showIcons()})
          .mouseout(function() {hideIcons()})
          .click(function() {mediator.onClickAddTask(task)});

  var showIcons = function(){editImg.show();addImg.show();},
      hideIcons = function(){editImg.hide();addImg.hide();};

  var s =  this.raphael.set().push(rc, editImg, addImg);
  return s;
}

ObjectMediator = function() {};
ObjectMediator.prototype.setUp = function(config, objects) {
   var socket       = new io.Socket(config.server_host,{port:config.port}),
       v            = config.visual,
       raphael      = Raphael(document.getElementById(config.paper_id),
                      v.paper.w, v.paper.h);
   this.taskRenderer = new TaskRenderer(config, raphael, this);
   this.config  = config;
   this.objects = objects;
   this.shapes  = {'start_task' : [],
                   'tasks'      : [],
                   'end_task'   : []};
   var mediator = this;

   var nextX = v.paper.margin.w;

   this.taskRenderer.renderStart(nextX);

   nextX += (v.rectStart.w + v.taskMargin);

   for (var i=0; i < objects.tasks.length; i++) {
     this.shapes.tasks = pushArrayAt(this.shapes.tasks, i,
                                     this.taskRenderer.renderTask(nextX, objects.tasks[i], this));
     nextX += (v.rectL.w + v.taskMargin);
   }
   this.taskRenderer.renderGoal(nextX,objects);
   var goal_task = this.taskRenderer.renderPath(nextX, mediator)
                       .click(function(evt){mediator.onClickPath(evt)});

   return;
};

ObjectMediator.prototype.onClickEditTask = function(task) {
    $("div#task_title").text(task.title);
}

ObjectMediator.prototype.onClickAddTask = function(task) {

}
ObjectMediator.prototype.addTask = function(x)
{
  var num     = this.taskNumByPathX(x),
      newTask = {title:'non title'},
      v       = this.config.visual,
      startTaskMargin   = v.rectStart.w + v.taskMargin,
      nextX   = v.paper.margin.w + startTaskMargin + (num * (v.rectL.w + v.taskMargin));

  this.objects.tasks = pushArrayAt(this.objects.tasks, num, newTask);

  var taskShape = this.taskRenderer.renderTask(nextX, newTask, this);

  this.shapes.tasks  = pushArrayAt(this.shapes.tasks, num, taskShape);
  this.moveTaskShapesAt(num + 1); // 追加分以降のものを移動
}
ObjectMediator.prototype.moveTaskShapesAt = function(num) 
{
  var tasks = this.shapes.tasks,
      v     = this.config.visual;
  if (0 < tasks.length) {
    for (var i = num; i < tasks.length; i++) {
      for (var n = 0;n <  tasks[i].items.length; n++){
        var item  = tasks[i].items[n];
        var x = item.getBBox().x;
        item.animate({'x': x + v.rectL.w + v.taskMargin}, 500);
      }
    }
  }
}

ObjectMediator.prototype.onClickPath = function(evt) {
  this.addTask(evt.x);
}
ObjectMediator.prototype.taskNumByPathX = function(pathX) {
  // 計算式が適当なので詳細詰め
  var v = this.config.visual;
  return parseInt(pathX / (v.taskMargin + v.rectL.w))-1;
}
