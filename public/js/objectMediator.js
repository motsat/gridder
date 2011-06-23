// 以下の仲介役
TaskRenderer = function(config, raphael, mediator) 
{
    this.o  = config.objects;
    this.v  = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
}
TaskRenderer.prototype.renderStart = function(x){

  var start_rect = this.raphael.rect(x, y = this.v.paper.margin.h, w = this.v.rectStart.w, 
                                     y2 = this.v.rectStart.h, this.v.taskR)
                                .attr($.extend(this.v.rectStart.attr, {'scale':0.1}))
                                .animate({'scale':1}, 700, 'bounce');
      var tx = this.raphael.text(x + this.v.font_m.padding_rect.x, 
                                 y + this.v.font_m.padding_rect.y, 'スタート').
                                 attr(this.v.font_m.attr);
}


TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.paper.margin.h + (v.rectStart.h / 2);

  return this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.paper.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate({'scale':1}, 800)
              .toBack();
}

TaskRenderer.prototype.renderEnd = function(x, task){
   var end_rect  = this.raphael.rect(x, y = this.v.paper.margin.h, w = this.v.rectEnd.w, y2 = this.v.rectEnd.h, this.v.taskR)
                       .attr($.extend(this.v.rectEnd.attr, {'scale':0.1}))
                       .animate({'scale':1}, 700, 'bounce'),
       tx        = this.raphael.text(x + this.v.font_m.padding_rect.x,
                                     y + this.v.font_m.padding_rect.y, task.end_title). 
                                     attr(this.v.font_m.attr);
      return this.raphael.set().push(end_rect, tx);
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
  var tx = this.raphael.text(x + this.v.font_m.padding_rect.x,
                             y + this.v.font_m.padding_rect.y, task.title). 
                            attr(this.v.font_m.attr)
                            .click(function(){showEditBox()});

  var showIcons   = function() {editImg.show();addImg.show();},
      hideIcons   = function() {editImg.hide();addImg.hide();},
      showEditBox = function() {
            log($('#task_title'));
            $('#task_title').val(task.title);
            $('#task_id').val(task.__id);
            $('#editbox').dialog({ draggable: true });
      };
  var s = this.raphael.set().push(rc, editImg, addImg,tx);
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
   this.shapes.end_task = this.taskRenderer.renderEnd(nextX,objects);
   this.taskRenderer.renderPath(nextX, mediator)
                    .click(function(evt){mediator.onClickPath(evt)});

   
  // setup editBox
  var onEnterKeyDown = function (key){log(key)};
  $('task_title').keydown(onEnterKeyDown);
  $('task_detail').keydown(onEnterKeyDown);
};

ObjectMediator.prototype.onClickEditTask = function(task) {
    //$("div#task_title").text(task.title);
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

ObjectMediator.prototype.moveRaphaelSets = function(sets, x) {

  for (var n = 0;n <  sets.items.length; n++){
    var item  = sets.items[n];
    var x = item.getBBox().x;
    item.animate({'x': x + v.rectL.w + v.taskMargin}, 500);
  }

}
ObjectMediator.prototype.moveTaskShapesAt = function(num) 
{
  var tasks = this.shapes.tasks,
      v     = this.config.visual;

  this.moveRaphaelSets(this.shapes.end_task, v.rectL.w + v.taskMargin );

  if (0 < tasks.length) {
    for (var i = num; i < tasks.length; i++) {
      this.moveRaphaelSets(tasks[i], v.rectL.w + v.taskMargin );
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
