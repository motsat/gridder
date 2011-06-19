// 以下の仲介役

TaskRenderer = function(config, raphael) 
{
    this.config  = config;
    this.raphael = raphael;
}

TaskRenderer.prototype.renderStart = function(x){
  var v       = this.config.visual,
      o       = this.config.objects,
      raphael = this.raphael;

  var start_rect = raphael.rect(x, y=v.campus.margin.h, w=v.rectStart.w, y2=v.rectStart.h, v.taskR)
                   .attr($.extend(v.rectStart.attr, {'scale':0.1}))
                   .animate({'scale':1}, 700, 'bounce');

  var b = start_rect.getBBox();
  var tx = raphael.text(b.x, b.y, '大項目').
      attr(v.font_m.attr);
}

TaskRenderer.prototype.renderGoal = function(x){
  var v       = this.config.visual,
      o       = this.config.objects,
      raphael = this.raphael;

   raphael.rect(x, y = v.campus.margin.h, w = v.rectEnd.w, y2 = v.rectEnd.h, v.taskR)
          .attr($.extend(v.rectEnd.attr, {'scale':0.1}))
          .animate({'scale':1}, 700, 'bounce');
}

TaskRenderer.prototype.renderPath = function(x){
  var v       = this.config.visual,
      o       = this.config.objects,
      raphael = this.raphael;
  var pathL_y = v.campus.margin.h + (v.rectStart.h / 2);

  var a = raphael.path($.sprintf('"M %d %d  L 1000 %d',v.campus.margin.w, pathL_y, pathL_y)) 
         .attr($.extend(v.pathL.attr,{'scale':0.1}))
         .animate({'scale':1}, 800)
         .toBack();
}
TaskRenderer.prototype.renderTask = function(x, i){
  var v       = this.config.visual,
      o       = this.config.objects,
      raphael = this.raphael;

  var rc = raphael.rect(x, y= v.campus.margin.h, w = v.rectL.w, h=v.rectL.h, v.taskR)
    .attr($.extend(v.rectL.attr, {'scale':0.1}))
    .animate({'scale':1}, 700, 'bounce')
    .mouseover(function(){im.show()})
    .mouseout(function(){im.hide()});

  var circle = raphael.circle(x + v.circle.r, y = v.campus.margin.h + v.circle.r, v.circle.r)
    .attr($.extend(v.circle.attr,{'scale':0.1}))
    .animate({'scale':1}, 700, 'bounce');

  // sets click handler on task's group
  var im = raphael.image('/images/pencil.gif', x, y =  v.campus.margin.h, w = v.icon.w, h = v.icon.h)
      .hide();

  im.mouseover(function(){im.show()});
  im.mouseout(function(){im.hide()});
  im.click(function(str){log(i+'click image')});
}
TaskRenderer.prototype.renderAll = function(x, i){

  // tasks描画
  var v       = this.config.visual,
      o       = this.config.objects,
      raphael = this.raphael;

    this.renderStart(nextX);

    nextX += (v.rectStart.w + v.taskInterval);

    for (var i=0; i < o.tasks.length; i++) { 
        this.renderTask(nextX,i);
        nextX += (v.rectL.w + v.taskInterval);
    }

    this.renderGoal(nextX);
    this.renderPath(nextX);

}

ObjectMediator = function() {};
ObjectMediator.prototype.setUp = function(config) {

   var socket       = new io.Socket(config.server_host,{port:config.port}),
       v            = config.visual;
       raphael      = Raphael(document.getElementById(config.paper_id), v.campus.w, v.campus.h),
       nextX        = v.campus.margin.w,
       taskRenderer = new TaskRenderer(config, raphael);

       taskRenderer.renderAll();
return;
};

