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
      return srcArray;
  }
  if (atNum == 0){ 
    return [pushVal].concat(srcArray);
  }

  var newAr = srcArray.slice(0, atNum);
  newAr.push(pushVal);
  newAr = newAr.concat(srcArray.slice(atNum));
  return newAr;
}
