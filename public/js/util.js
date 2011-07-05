function pathToString(paths){
  var str = '';
  for (var i =0; i < paths.length; i++) {
    path = paths[i];
    for (var n = 0; n < path.length; n++) {
        if (path[n] == 'length'){
          continue;
        }
        str += path[n]+' ';
    }
  }
  return str;
}

function isNaNx(value)
{
  return parseInt(value).toString() == 'NaN';
}
function pushArrayAt(srcArray, atNum, pushVal)
{
  if (srcArray.length < atNum) {
    throw 'error: srcArray.length < atNum';
  }

  if (srcArray.length == atNum) {
      srcArray.push(pushVal);
      return;
  }
  if (atNum == 0){ 
    srcArray.unshift(pushVal);
    return;
  }

  var frontArr = srcArray.slice(0, atNum);
      frontArr.push(pushVal);
  var backArr = srcArray.slice(atNum);

  Array.prototype.splice.apply(srcArray, [0, srcArray.length].concat(frontArr.concat(backArr)));
}
function log(msg)
{
    if (typeof console == 'object') {
        console.log(msg);
    }
}
