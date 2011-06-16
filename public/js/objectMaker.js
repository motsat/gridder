// デザインパターンのfactory
// 親オブジェクトで共通クラスを定義し、また親オブジェトが子オブジェクトを生成する
// 子オブジェクトはfactoryメソッドで固有の処理を生成し返す
function ObjectMaker() {};

ObjectMaker.prototype.setMediator = function(mediator) {this.mediator = mediator};
ObjectMaker.prototype.setStatus   = function(status) {this.status = status};
ObjectMaker.prototype.getStatus   = function(status) {return this.status};
ObjectMaker.prototype.isLocked    = function(status) {return this.getStatus() == OBJECT_STATUS.LOCK};
ObjectMaker.prototype.getObject   = function(status) {return this.raphaelObject};
ObjectMaker.prototype.setType     = function(status) {return this.type};
ObjectMaker.prototype.getType     = function(status) {return this.type};
ObjectMaker.prototype.getId       = function(status) {return this.id};

ObjectMaker.factory = function (type, raphael, id, factory)
{
  if (typeof ObjectMaker[type] !== 'function'){
    throw type + ' not found';
  }

  // 一度だけ親のプロトタイプを生成
  if (!ObjectMaker[type].prototype.getStatus !== 'function') {
    ObjectMaker[type].prototype = new ObjectMaker();
  }

  var newObject = new ObjectMaker[type](raphael);

  // 全Objectで共通の処理
  newObject.status        = OBJECT_STATUS.NONE;
  newObject.id            = id;
  newObject.object.id     = id; // drag処理のためのID
  newObject.object.parent = newObject; // dragだとraphaelがthisになるので対策
  newObject.object.mediator = mediator;

  return newObject;
}

// 個別のコード
ObjectMaker.Circle = function (raphael){
  this.type = OBJECT_TYPE.CIRCLE;
  this.object = raphael.circle(x=50, y=50, r=40)
    .attr({'gradient':'270-#9ACD32-#FFFF00'})

    var onDragStart = function(x, y, event)
    {
      if (this.parent.getStatus() == OBJECT_STATUS.LOCK){
        log('object is locked');
        return;
      }
      this.ox = this.attr("cx");
      this.oy = this.attr("cy");
      this.attr({opacity:'0.4'});
      this.mediator.onObjectDragStart(this.id);
    };
    var onDrag = function(x, y){
    if (this.parent.isLocked()) {
      return;
    }
    this.attr({"cx":this.ox + x, "cy":this.oy + y})
  };


  var onDragEnd = function(event) {
    if (this.parent.isLocked()) {
      return;
    }

    var attr = {"cx" : this.attr('cx'),
                "cy" : this.attr('cy')};

    this.mediator.onObjectDragEnd(this.id, attr);

    this.attr({opacity:'1.0'});
  }
  this.object.drag(onDrag, onDragStart, onDragEnd);
}

ObjectMaker.Path = function (raphael){
  this.type = OBJECT_TYPE.PATH;
  this.object = raphael.path("M 00 00 L 50 100")      // M =MoveTo L=LineTo C=CurveTO A=ArcTo
      .attr({"stroke":"darkred", "stroke-width":2});

  var onDragStart = function(event){
    if (this.parent.isLocked()) {
      return;
    }
    var opath = this.attr().path;

    this.ox = 0;
    this.oy = 0;

    this.attr({opacity:'0.4'});
    this.mediator.onObjectDragStart(this.id);
  }
  var onDrag = function(x, y){
    var opath = this.opath;
    this.translate(x - this.ox, y-this.oy);
    this.ox = x;
    this.oy = y;
  }
  var onDragEnd = function(event){
    if (this.parent.isLocked()) {
      return;
    }

    var attr = {path : this.attr().path};
    this.mediator.onObjectDragEnd(this.id, attr);
    this.attr({opacity:'1.0'});
  }
  this.object.drag(onDrag, onDragStart, onDragEnd);
}
