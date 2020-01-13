exports.td = function(style, content){
	return "<td class='" + style + "'>" + content + "</td>";
}
exports.tr = function(style, content){
	return "<tr class='" + style + "'>" + content + "</tr>";
}
exports.table = function(style, content) {
	return "<table class='" + style + "'>" + content + "</table>";
}
exports.ul = function(style, content) {
	return "<ul class='" + style + "'>" + content + "</ul>";
}
exports.li = function(style, content) {
	return "<li class='" + style + "'>" + content + "</li>";
}
exports.isdefined=function (thing){
  var r = true;
  if (typeof thing === 'undefined') {
    r=false;
  }
  return r;
}
exports.isundefined=function (thing){
  var r = false;
  if (typeof thing === 'undefined') {
    r=true;
  }
  return r;
}
