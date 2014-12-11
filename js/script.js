

/******************

 check local storage availability

 *******************/

window.onload = function(){

    if(isLocalStorage()){
        console.log('localStorage OK');

    }else{
        console.log('localStorage NO');
    }
}

function isLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e){
        return false;
    }
}

/******************

    mouse related event

 *******************/

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
    if(target.className =='delete-btn')return; // exception for delete button on UNDO area

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
        var textArea = e.target.previousSibling;
        var s = getStyle(textArea);

        var targetNote = findParent(e,'wrapper');
        // save textarea data as JSON format
        var dataObj ={
            'width': s.width,
            'height': s.height,
            'text':textArea.value
        }

        // save into localStrage for 5 seconds...
        localStorage.setItem(targetNote.id,JSON.stringify(dataObj));

        var undoArea = createElement('DIV');
        undoArea.setAttribute('class','undo-wrapper');
        undoArea.style.width = s.width;
        undoArea.style.height = s.height;
        var offset = 20;
        undoArea.style.top = (parseInt(targetNote.style.top)+offset).toString() + 'px';
        undoArea.style.left = (parseInt(targetNote.style.left)+offset).toString() + 'px';
        var span = createElement('SPAN');
        var textUndo = document.createTextNode('UNDO');
        span.setAttribute('class','undo-text');
        span.appendChild(textUndo);
        undoArea.appendChild(span);

        var deleteBtn = createElement('SPAN');
        var textX = document.createTextNode('x');
        setAttributes(deleteBtn,{'class':'delete-btn','id':targetNote.id}); // use the same id as note to delete button, this gonna be key for local strage
        deleteBtn.appendChild(textX);
        undoArea.appendChild(deleteBtn);

        document.querySelector('body').removeChild(targetNote);
        list.splice(list.indexOf(targetNote),1); // remove element from list

        document.querySelector('body').appendChild(undoArea); // add undo area
        undoAreaList.push(undoArea);


    }else if(e.target.className=='delete-btn'){

        // remove undo area including undo text
        var undoWrapper = findParent(e,'undo-wrapper');
        document.querySelector('body').removeChild(undoWrapper); // remove undo area
        undoAreaList.splice(undoAreaList.indexOf(targetNote),1);
        localStorage.removeItem(e.target.id); // remove data from local storage
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

/******************

     generate note

 *******************/

var btn = document.querySelector('#generate');
var list=[];
var undoAreaList =[];
btn.addEventListener('click',function(e){

    var div = createElement('DIV');
    var section = createElement('SECTION');
    var textarea = createElement('TEXTAREA');
//    textarea.style.height='200px';
//    textarea.value = 'test';
    var span = createElement('SPAN');
    var textX = document.createTextNode('x');

    div.setAttribute('class','wrapper');
    div.setAttribute('id','post-it-'+list.length);
    section.setAttribute('class','container');
    span.setAttribute('class','close-btn');

    section.appendChild(textarea);
    section.appendChild(span);
    span.appendChild(textX);

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
    var parent = e.target||e; // set target itself as a default

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


