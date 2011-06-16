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

