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
    if(target.className.search('wrapper') != -1){
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

    var targetNote = findParent(e,'wrapper');
    if(targetNote)
    {
        // change the z-index order of elements
        if(list.length>1) bringToFront(targetNote);
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
    // remove element (note)
    if(e.target.className=='close-btn')
    {
        var targetNote = findParent(e,'wrapper');
        document.querySelector('body').removeChild(targetNote);
        // remove element from list as well
        list.splice(list.indexOf(targetNote),1);
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

/* generate note */

var btn = document.querySelector('#generate');
var list=[];
btn.addEventListener('click',function(e){

    var div = createElement('DIV');
    var section = createElement('SECTION');
    var textarea = createElement('TEXTAREA');
    var span = createElement('SPAN');
    var closeText = document.createTextNode('x');

    div.setAttribute('class','wrapper');
    div.setAttribute('id','post-it-'+list.length);
    section.setAttribute('class','container');
    setAttributes(span,{'class':'close-btn'});

    section.appendChild(textarea);
    section.appendChild(span);
    span.appendChild(closeText);

    div.appendChild(section);
    list.push(div);
    div.style.zIndex = list.length;
    document.querySelector('body').appendChild(div);

});

// Bring obj you clicked to front
// 1. remove clicked note from list and push to the same list again (change the order)
// 2. set z-index again follow list array order to move note clicked to top z-index
function bringToFront(clickedObj){

    for(var i=0;i<list.length;i++)
    {
        if(list[i].id== clickedObj.id)
        {
            list.push(list.splice(i,1)[0]);

            for(i=0;i<list.length;i++)
            {
                list[i].style.zIndex = i;
            }
            break;
        }
    }
}

/******************
 *
 *      Helper
 *
 ******************/
function setAttributes(el,args){
    for(var key in args){
        el.setAttribute(key,args[key]);
    }
}

function createElement(el){
    var el = el || 'DIV';
    return document.createElement(el);
}

function findParent(e,key){
    // traverse parent until reach "null"
    var parent = e.target; // set target itself as a default

    while (parent!=null)
    {
        if(parent.className.search(key) != -1 || parent.id.search(key) !=-1)
        {
            return parent;
        }else{
            parent = parent.parentNode;
        }
    }
    return false;
}

