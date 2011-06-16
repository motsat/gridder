// 以下の仲介役
ObjectMediator = function() {};
ObjectMediator.prototype.setUp             = function() {};
ObjectMediator.prototype.onObjectDragStart = function(id){
    socket.send({'action': ACTION_TYPE.REQUEST_LOCK, 'id': id})
};
ObjectMediator.prototype.onObjectDragEnd = function(id, attr){
    socket.send({"action": ACTION_TYPE.REQUEST_EDIT,
                 "id"    : id,
                 "attr"  : attr});
};

ObjectMediator.prototype.setUp = function() {
   var collection = new ObjectCollection();
       socket     = new io.Socket('motoki.local',{port:8000}),
       raphael    = Raphael(document.getElementById('svg_campus'), 500, 500);

     socket.connect();
     socket.on('message', function(msg)
     {

       if (msg.action == ACTION_TYPE.CREATE) {
           createObject(msg.id, msg.type);
           return;
       }

       var obj = collection.find(msg.id);

       switch (msg.action) {
         case ACTION_TYPE.LOCK:
           obj.setStatus(OBJECT_STATUS.LOCK);
           break;
         case ACTION_TYPE.EDIT:
           obj.setStatus(OBJECT_STATUS.NONE);
           // typeによって処理？
           // attrって渡し方がよくない気がする。pathとかattrとかいろいろあるし
           // 何がある？
           switch (obj.type){
           case OBJECT_TYPE.CIRCLE:
             obj.object.animate(msg.attr, 300);
             break;
           case OBJECT_TYPE.PATH:
             //obj.object.attr({path:pathToString(msg.attr.path)});
             obj.object.animate({path:pathToString(msg.attr.path)},300);
            break;
           }
           break;
       }
     });

     $('#creae_button').bind('click', function() {
         socket.send({"action":ACTION_TYPE.REQUEST_CREATE,
           "type"  :$('#object_type').val()});
         });

var createObject = function (id, type)
{
    var objectName;
    switch (type) {
      case  OBJECT_TYPE.CIRCLE:
        objectName = 'Circle';
        break;
      case  OBJECT_TYPE.PATH:
        objectName = 'Path';
        break;
      default:
        throw('unknown type ' + type);
        break;
    }
    collection.add(ObjectMaker.factory(objectName, raphael, id, mediator));
};
};

