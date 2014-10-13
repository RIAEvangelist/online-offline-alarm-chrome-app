(
    function(){
        var moduleName='header';

        function render(el){
            el.addEventListener(
              'click',
              function(e){
                if(
                  !chrome.app.window.current()[e.target.id] &&
                  e.target.id != 'setAlarm' &&
                  e.target.id != 'settings' &&
                  e.target.id != 'home'
                ){
                  return;
                }

                switch(e.target.id){
                  case 'setAlarm' :
                  case 'settings' :
                  case 'home' :
                    app.navigate(e.target.id);
                    break;
                  case 'fullscreen' :
                    if(chrome.app.window.current().isFullscreen()){
                      chrome.app.window.current().restore();
                      break;
                    }
                  default :
                    chrome.app.window.current()[e.target.id]();
                }
              }
            );
        }

        exports(moduleName,render);
    }
)();