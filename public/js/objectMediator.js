// 以下の仲介役
TaskRenderer = function(config, raphael, mediator) 
{
    this.o  = config.objects;
    this.v  = config.visual;
    this.raphael  = raphael;
    this.mediator = mediator;
    this.shapes = {
        'start_task' : [],
        'tasks'      : [],
        'end_task'   : []
    };
}
TaskRenderer.prototype.renderStart = function(x){

  var start_rect = this.raphael.rect(x, y=this.v.campus.margin.h, w= this.v.rectStart.w, 
                                     y2= this.v.rectStart.h, this.v.taskR)
                                .attr($.extend(this.v.rectStart.attr, {'scale':0.1}))
                                .animate({'scale':1}, 700, 'bounce');

  start_rect.click(this.mediator.onTaskClick);

  var bBox  = start_rect.getBBox(),
      tx    = this.raphael.text(bBox.x, bBox.y, 'スタート').
              attr(this.v.font_m.attr);
}


TaskRenderer.prototype.renderPath = function(x, mediator){
  var pathL_y = v.campus.margin.h + (v.rectStart.h / 2);

  var a = this.raphael.path($.sprintf('"M %d %d  L 1000 %d',this.v.campus.margin.w, pathL_y, pathL_y)) 
              .attr($.extend(this.v.pathL.attr,{'scale':0.1}))
              .animate({'scale':1}, 800)
              .click(function(evt){mediator.onClickPath(evt)})
              .toBack();

}

TaskRenderer.prototype.renderGoal = function(x){
   var goal_rect  = this.raphael.rect(x, y = this.v.campus.margin.h, w = this.v.rectEnd.w, y2 = this.v.rectEnd.h, this.v.taskR)
                        .attr($.extend(this.v.rectEnd.attr, {'scale':0.1}))
                        .animate({'scale':1}, 700, 'bounce'),
       bBox       = goal_rect.getBBox(),
       tx         = this.raphael.text(bBox.x, bBox.y, this.o.goal_title).
                    attr(this.v.font_m.attr);
}

TaskRenderer.prototype.renderTask = function(x, task, mediator){

  var rc = this.raphael.rect(x, y= v.campus.margin.h, w = v.rectL.w, h=v.rectL.h, v.taskR)
               .attr($.extend(v.rectL.attr, {'scale':0.1}))
               .animate({'scale':1}, 700, 'bounce')
               .mouseover(function() {showIcons()})
               .mouseout(function() {hideIcons()});

  var editImg = this.raphael.image('/images/pencil.gif', x, y =  v.campus.margin.h, w = v.icon.w, h = v.icon.h)
          .hide()
          .mouseover(function() {showIcons()})
          .mouseout(function() {hideIcons()})
          .click(function() {mediator.onClickEditTask(task)});

  var addImg = this.raphael.image('/images/plus.png', x + v.icon.margin , y =  v.campus.margin.h, w = v.icon.w, h = v.icon.h)
          .hide()
          .mouseover(function() {showIcons()})
          .mouseout(function() {hideIcons()})
          .click(function() {mediator.onClickAddTask(task)});

  var showIcons = function(){editImg.show();addImg.show();},
      hideIcons = function(){editImg.hide();addImg.hide();};


  var e = this.raphael.set()
              .push(rc)
              .push(editImg)
              .push(addImg);

  this.shapes.tasks.push(e);
log(this.shapes);
log(this.shapes.tasks.length);
}

TaskRenderer.prototype.renderAll = function(mediator){

    var nextX = this.v.campus.margin.w;
    this.mediator = mediator;

    this.renderStart(nextX);

    nextX += (this.v.rectStart.w + this.v.taskMargin);

    for (var i=0; i < this.o.tasks.length; i++) { 
        this.renderTask(nextX, this.o.tasks[i], mediator);
        nextX += (this.v.rectL.w + this.v.taskMargin);
    }

    this.renderGoal(nextX);
    this.renderPath(nextX, mediator);
}
ObjectMediator = function() {};
ObjectMediator.prototype.setUp = function(config) {
   var socket       = new io.Socket(config.server_host,{port:config.port}),
       raphael      = Raphael(document.getElementById(config.paper_id), config.visual.campus.w, config.visual.campus.h),
       taskRenderer = new TaskRenderer(config, raphael, this);

   this.config  = config;
   taskRenderer.renderAll(this);
   return;
};

ObjectMediator.prototype.onClickEditTask = function(task) {
    $("div#task_title").text(task.title);
}

ObjectMediator.prototype.onClickAddTask = function(task) {

}

ObjectMediator.prototype.onClickPath = function(evt) {

  var num = this.taskNumByPathX(evt.x);
  this.config.objects.tasks = pushArrayAt(this.config.objects.tasks, num-1, {title:'non title'});

  // 新タスクの描画

  // 描画済みタスクの移動
}
ObjectMediator.prototype.taskNumByPathX = function(pathX) {
  // 計算式が適当なので詳細詰め
  var v = this.config.visual;
  return parseInt(pathX / (v.taskMargin + v.rectL.w));
}
