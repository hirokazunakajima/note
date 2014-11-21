/*
*   drag able contents
*/

var root = document.documentElement;
var el = document.getElementById('box1');
var rect = el.getBoundingClientRect();
document.body.appendChild(el);

var left = window.pageXOffset || root.scrollLeft;
var top = window.pageYOffset || root.scrollTop;

el.style.left = (rect.left + left) + 'px';
el.style.top = (rect.top + top) + 'px';

var dragging = false;
var x,y;

// think of the extend able function for multi post it
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


el.addEventListener('mousedown', function(e){

    if(e.target === el)
    {
        dragging = true;
        x = e.offsetX || e.layerX; // keep current position
        y = e.offsetY || e.layerY;
        dragging = true;

        var rect = el.getBoundingClientRect();
        var left = window.pageXOffset || root.scrollLeft;
        var right = window.pageYOffset || root.scrollTop;

        el.style.left = left + rect.left + 'px';
        el.style.top = top + rect.top + 'px';
        el.style.position = 'absolute';
    }

},false);


document.addEventListener('mouseup',function(e){
    dragging = false;
    var rect = el.getBoundingClientRect();
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';
    el.style.position = 'fixed';
},false);


function mousemove(e){
    if(dragging)
    {
        var left = window.pageXOffset || root.scrollLeft;
        var top  = window.pageYOffset || root.scrollTop;
        el.style.left = left + e.clientX - x + 'px';
        el.style.top = top + e.clientY - y + 'px';

    }
}