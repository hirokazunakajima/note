/*
*   drag able contents ( not for IE now )
*/

var root = document.documentElement;
var dragging = false;
var x,y,dy,dx;
var el;

// mainly this function will is used to remove 'mousemove' envet as much as possible.
var addEvent = function(node,type,listener){
    node.addEventListener(type,listener,false);
}

var removeEvent = function(node,type,listener){
    node.removeEventListener(type,listener,false);
}

addEvent(document,'mousedown',function(e){
    addEvent(document,'mousemove',mousemove);
});

addEvent(document,'mouseup',function(e){
    removeEvent(document,'mousemove',mousemove);
});


var left = root.scrollLeft;
var top = root.scrollTop;

function getStyle(el){
    // get style (we can get result of that which type of style is assigned to target element)
    return window.getComputedStyle(el,'');
}

addEvent(document,'mousedown',function(e){

    var target = e.target;
    if(target.className == 'wrapper'){
        x = e.offsetX || e.layerX; //webkit || moz
        y = e.offsetY || e.layerY;
        dragging = true;
        el = target;
        var style = getStyle(el);
        var rect = el.getBoundingClientRect();
        var left = root.scrollLeft;
        var top = root.scrollTop;

        if(style.position === 'fixed'){
            fixed = true;
            dx = 0;
            dy = 0;
        }else{
            fixed = false;
            dx = (rect.left + left) - el.offsetLeft;
            dy = (rect.top + top) - el.offsetTop;
        }

        addEvent(document,'mousemove',mousemove);
    }

});


addEvent(document,'mouseup',function(e){
    if(dragging){
        dragging = false;
        removeEvent(document,'mousemove',mousemove);
        var rect = el.getBoundingClientRect();
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.position = 'fixed';
    }
});


function mousemove(e){
    if(dragging)
    {
        var left = fixed ? 0: root.scrollLeft;
        var top  = fixed ? 0 : root.scrollTop;
        el.style.left = left + e.clientX - x - dx+ 'px';
        el.style.top = top + e.clientY - y -dx + 'px';

    }
}