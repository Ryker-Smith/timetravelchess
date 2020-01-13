
function finishedloading() {
  document.getElementById('loaderanimation').src='';
  document.getElementById('loaderanimation').style.display='none'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
