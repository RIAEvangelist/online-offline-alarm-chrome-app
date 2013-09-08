var clock={};
clock.alarm={};
clock.alarm.time=false;
clock.alarm.toneLength=1000;
clock.alarm.toneBreakLength=300;
clock.alarm.sounding=false;
window.AudioContext = (
    window.AudioContext ||
    window.webkitAudioContext ||
    null
);
var width = 450,
    height = 190;

if (!AudioContext) {
    alert('HTML5 AudioContext not supported \n:=( \nAlarm won\'t sound');
    throw new Error("AudioContext not supported!");
}
chrome.app.runtime.onLaunched.addListener(
    function() {
        var screenWidth = screen.availWidth;
        var screenHeight = screen.availHeight;
        if(clock.window){
            if(clock.window.chrome.app.window.id){
                clock.window.chrome.app.window.current().show();
                return;
            }
        }
        chrome.app.window.create(
            'index.html', 
            {
                id:'clock',
                singleton:true,
                bounds: {
                    width: width,
                    height: height,
                    left: Math.round((screenWidth-width)/2),
                    top: Math.round((screenHeight-height)/2)
                },
                minWidth:width,
                minHeight:height,
                maxWidth:width,
                maxHeight:285,
                frame:'none'
            },
            appOpened
        );
    }
);

function appOpened(e){
    e.contentWindow.onload=clock.onload;
    clock.window=e.contentWindow;
    clock.window.chrome.app.window.current().resizeTo(width,height);
}

clock.onload=function(e){
    clock.document=e.target;
    var d=new Date();
    var alarmMin=clock.document.getElementById('alarmMin'),
        alarmHour=clock.document.getElementById('alarmHour'),
        alarmTime=clock.document.getElementById('alarmTime'),
        setAlarm=clock.document.getElementById('setAlarm'),
        stopAlarm=clock.document.getElementById('stopAlarm'),
        min=clock.document.getElementById('min');
        
    var option='<option value="{value}">{value}</value>',
        hours=[],
        mins=[];
    for(var i=0; i<24; i++){
        hours[i]=option.replace(/\{value\}/g,i);
    }
    for(var i=0; i<60; i++){
        mins[i]=option.replace(/\{value\}/g,i);
    }
    
    alarmHour.innerHTML+=hours.join('');
    alarmMin.innerHTML+=mins.join('');
    
    if(clock.alarm.time){
        alarmTime.innerHTML=clock.alarm.time;
    }
    
    clock.tick();
    
    min.addEventListener(
        'click',
        function(e){
            clock.window.chrome.app.window.current().minimize();
        }
    );
    
    alarmTime.addEventListener(
        'click',
        clock.showSettings
    );
    
    setAlarm.addEventListener(
        'click',
        clock.alarm.set
    );
        
    stopAlarm.addEventListener(
        'click',
        function(){
            clock.alarm.kill();
            clock.alarm.stop();
            setTimeout(
                function(){
                    clock.document.body.style.backgroundColor='rgb(0,0,0)';
                },
                200
            )
        }
    );
}

clock.currentTime=function(){
    var d=new Date();
    var min=d.getMinutes().toString();
    return d.getHours()+':'+((min.length<2)?'0'+min:min);
}

clock.tick=function(){
    var now=clock.currentTime();
    if(clock.document)
        clock.document.getElementById('time').innerHTML=now;
    if(!clock.alarm.time)
        return;
    if(clock.alarm.time==now && !clock.alarm.sounding)
        clock.alarm.start();
}

clock.alarm.sound={
    low: {
        hertz : 200
    },
    mid: {
        hertz : 500
    },
    high: {
        hertz : 1000
    }
};
clock.alarm.context=new AudioContext();
clock.alarm.mainVolume=clock.alarm.context.createGainNode();
clock.alarm.mainVolume.connect(clock.alarm.context.destination);
clock.alarm.oscillators={};

clock.alarm.start=function(){
    clock.window.chrome.app.window.current().restore();
    clock.alarm.killed=false;
    clock.alarm.sounding=true;
    clock.showSettings();
    clock.document.body.style.backgroundColor='rgb(255,150,150)';
    for (var i in clock.alarm.sound) {
        var oscillator,
            tone=clock.alarm.sound[i];

        clock.alarm.oscillators[i]={};
        oscillator=clock.alarm.oscillators[i];
        oscillator.tone=clock.alarm.context.createOscillator();
        oscillator.volume=clock.alarm.context.createGainNode();
        oscillator.tone.type=0;
        oscillator.tone.frequency.value=tone.hertz;
        oscillator.tone.connect(oscillator.volume);
        oscillator.volume.connect(clock.alarm.mainVolume);
    }
    
    for (i in clock.alarm.sound) {
        var oscillator=clock.alarm.oscillators[i];
        oscillator.tone.noteOn && oscillator.tone.noteOn(0);
    }
    
    clock.alarm.beat=setTimeout(
        function(){
            clock.alarm.stop();
            clock.alarm.beat=setTimeout(
                function(){
                    if(!clock.alarm.killed){
                        clock.alarm.start();
                        clock.document.body.style.backgroundColor='rgb(255,150,150)';
                    }else{
                        clock.document.body.style.backgroundColor='rgb(0,0,0)';
                    }
                },
                clock.alarm.toneBreakLength
            )
        },clock.alarm.toneLength
    )
}

clock.alarm.stop=function(){
    clock.alarm.sounding=false;
    clock.document.body.style.backgroundColor='rgb(255,255,255)';
    for (i in clock.alarm.sound) {
        var oscillator=clock.alarm.oscillators[i];
        if(!oscillator)
            continue;
        if(!oscillator.tone)
            continue;
        oscillator.tone.stop(0);
    }
}

clock.alarm.set=function(){
    var alarmMin=clock.document.getElementById('alarmMin'),
        alarmHour=clock.document.getElementById('alarmHour'),
        alarmTime=clock.document.getElementById('alarmTime')
    
    clock.alarm.killed=false;
    clock.alarm.time=alarmHour.value+':'+((alarmMin.value.length<2)?'0'+alarmMin.value:alarmMin.value);
    alarmTime.innerHTML=clock.alarm.time;
    clock.document.getElementById('settings').style.opacity='0';
    var clockWindow=clock.window.chrome.app.window.current();
    var clockBounds=clockWindow.getBounds();
    if(clockBounds.height==285)
        clockWindow.resizeTo(clockBounds.width,190);
    chrome.power.requestKeepAwake('system');
}

clock.alarm.kill=function(){
    var alarmTime=clock.document.getElementById('alarmTime');
    clock.alarm.killed=true;
    clock.alarm.time=false;
    alarmTime.innerHTML='-:--';
    chrome.power.releaseKeepAwake();
}

clock.showSettings=function(){
    var clockWindow=clock.window.chrome.app.window.current();
    var clockBounds=clockWindow.getBounds();
    if(clockBounds.height<285)
        clockWindow.resizeTo(clockBounds.width,285);
    clock.document.getElementById('settings').style.opacity='1';
}

clock.tick();
setInterval(
    clock.tick,
    7000
);