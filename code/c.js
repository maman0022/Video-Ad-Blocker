browser.runtime.onMessage.addListener(goback);

function goback(message){
window.history.go(-1);
}