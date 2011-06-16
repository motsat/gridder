// 以下の仲介役
ObjectCollection = function(){this.objects = [];};
ObjectCollection.prototype.add  = function(object) {this.objects.push(object)};
ObjectCollection.prototype.find = function(id) {
  for (var i in this.objects) {
        if (id ==  this.objects[i].id) {
            return this.objects[i];
        }
    }
    throw 'object not found id:' + id;
};

