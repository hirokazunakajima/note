/******************

 check local storage availability

 *******************/

//"use strict";

window.onload = function () {

    if (isLocalStorage()) {
        console.log('localStorage OK');

        // set primary key to note
        if(localStorage.getItem('primaryKey')===null){
            localStorage.setItem('primaryKey','0');
        }

        // load saved data last time
        for(var i =0;i<localStorage.length;i++)
        {
            var pattern = /^note-\d+$/;
            if(pattern.test(localStorage.key(i))){
//                console.log(localStorage.key(i));
                var d = JSON.parse(localStorage.getItem(localStorage.key(i)));
                createNote(d.id, d.top, d.left, d.width, d.height, d.text);
            };
        }

    } else {
        console.log('localStorage NO');
    }
}


function isLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

/************************************

 mouse related event

 *************************************/

var root = document.documentElement;
var dragging = false;
var x, y, dy, dx;
var el;

// mainly this function will is used to remove 'mousemove' envet as much as possible.
var addEvent = function (node, type, listener) {
    node.addEventListener(type, listener, false);
}

var removeEvent = function (node, type, listener) {
    node.removeEventListener(type, listener, false);
}

addEvent(document, 'mousedown', function (e) {
    addEvent(document, 'mousemove', mousemove);
});

addEvent(document, 'mouseup', function (e) {
    removeEvent(document, 'mousemove', mousemove);
});


var left = root.scrollLeft;
var top = root.scrollTop;

function getStyle(el) {
    // get style (we can get result of that which type of style is assigned to target element)
    return window.getComputedStyle(el, '');
}

addEvent(document, 'mousedown', function (e) {

    var target = e.target;
    if (target.className == 'delete-btn')return; // exception for delete button on UNDO area

    if (target.className.search('wrapper') != -1) {

        x = e.offsetX || e.layerX; //webkit || moz
        y = e.offsetY || e.layerY;
        dragging = true;
        el = target;
        var style = getStyle(el);
        var rect = el.getBoundingClientRect();
        var left = root.scrollLeft;
        var top = root.scrollTop;

        if (style.position === 'fixed') {
            fixed = true;
            dx = 0;
            dy = 0;
        } else {
            fixed = false;
            dx = (rect.left + left) - el.offsetLeft;
            dy = (rect.top + top) - el.offsetTop;
        }

        addEvent(document, 'mousemove', mousemove);

    }

    var targetNote = findParent(e, 'wrapper');
    if (targetNote) {
        // change the z-index order of elements
        if (noteList.length > 1 )
        {
            bringToFront(targetNote);
        }
    }

});


addEvent(document, 'mouseup', function (e) {
    if (dragging) {
        dragging = false;
        removeEvent(document, 'mousemove', mousemove);
        var rect = el.getBoundingClientRect();
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.position = 'fixed';
    }

});


function mousemove(e) {
    if (dragging) {
        var left = fixed ? 0 : root.scrollLeft;
        var top = fixed ? 0 : root.scrollTop;
        el.style.left = left + e.clientX - x - dx + 'px';
        el.style.top = top + e.clientY - y - dx + 'px';
    }
}


/************************************

    Close note, undo note, delete note

 *************************************/

function closeNote(e){

// remove element (note)
    if (e.target.className == 'close-btn') {
        var targetNote = findParent(e, 'wrapper');
        var textArea = e.target.previousSibling;
        var s = getStyle(textArea);

        // if textarea isn't empty, create undoArea
        if (textArea.value !== '') {

            // save textarea data as JSON format
            var dataObj = {
                'id':targetNote.id,
                'top': targetNote.style.top,
                'left': targetNote.style.left,
                'width': s.width,
                'height': s.height,
                'text': textArea.value
            }

            // save object into localStorage
            localStorage.setItem(targetNote.id, JSON.stringify(dataObj));
            textArea.setAttribute('readonly','');
            targetNote.className = targetNote.className + ' wrapper-disabled';
            var buttons = document.querySelectorAll('#'+targetNote.id + ' .container > span');
            for(var i=0; i<buttons.length; i++)
            {
                document.querySelector('#'+targetNote.id + ' .container').removeChild(buttons[i]);
            }


            var undoButton = createElement('button');
            var textUndo = document.createTextNode('UNDO');
            setAttributes(undoButton, {'class': 'undo-btn', 'data-id': targetNote.id});

            undoButton.appendChild(textUndo);
            targetNote.appendChild(undoButton);

            var deleteButton = createElement('button');
            var textDelete = document.createTextNode('DELETE');
            setAttributes(deleteButton, {'class': 'delete-btn', 'id': targetNote.id}); // use the same id as note to delete button, this gonna be key for local strage
            deleteButton.appendChild(textDelete);
            targetNote.appendChild(deleteButton);

            undoButton.addEventListener('click', undoData);
            deleteButton.addEventListener('click', deleteData);

        }else{
            // save -> undo -> remove all text -> then push close button
            localStorage.removeItem(targetNote.id);
            document.querySelector('body').removeChild(targetNote);
            noteList.splice(noteList.indexOf(targetNote), 1); // remove element from noteList
        }
    }
}


function undoData(e) {

    if (e.target.className == 'undo-btn') {

        var targetNote = findParent(e, 'wrapper');
        var undoButton = e.target;
        var dataId = undoButton.getAttribute('data-id');
        var d = JSON.parse(localStorage.getItem(dataId));

    // 1, remove undo, delete button
        var undoButton = e.target;
        var deleteButton = targetNote.querySelector('.delete-btn');
        targetNote.removeChild(undoButton);
        targetNote.removeChild(deleteButton);

    // 2, create close button
        var closeButton = createElement('SPAN');
        closeButton.appendChild(document.createTextNode('x'));
        closeButton.setAttribute('class', 'close-btn');
        closeButton.addEventListener('click',closeNote);

        var zoomButton = createElement('SPAN');
        zoomButton.setAttribute('class', 'zoom-btn');
        zoomButton.addEventListener('click',zoomNote);
        zoomButton.appendChild(document.createTextNode('+'));

        var smallButton = createElement('SPAN');
        smallButton.setAttribute('class', 'small-btn');
        smallButton.addEventListener('click',smallNote);
        smallButton.appendChild(document.createTextNode('-'));

        var container = document.querySelector('#'+ d.id + ' .container');
        container.appendChild(closeButton);
        container.appendChild(zoomButton);
        container.appendChild(smallButton);


    // 3, remove readonly property
        var textArea = document.querySelector('#'+ d.id + ' textarea');
        textArea.removeAttribute("readonly");

    // 4, change CSS (remove ".wrapper-disabled")
        targetNote.className = targetNote.className.replace(/\b.wrapper-disabled\b/,'');

    }
}

function deleteData(e) {

    if (e.target.className == 'delete-btn') {

        var targetNote = findParent(e, 'wrapper');
        document.querySelector('body').removeChild(targetNote); // remove undo area
        localStorage.removeItem(e.target.id); // remove data from local storage
        noteList.splice(noteList.indexOf(targetNote), 1); // remove element from noteList
    }
}

function zoomNote(e) {
    var targetNote = findParent(e, 'wrapper');
    var textArea = document.querySelector('#'+targetNote.id + ' textarea');

    if(parseInt(textArea.style.fontSize)<30){
        textArea.style.fontSize = (parseInt(textArea.style.fontSize)+1).toString() + 'px';
    }
}
function smallNote(e) {
    var targetNote = findParent(e, 'wrapper');
    var textArea = document.querySelector('#'+targetNote.id + ' textarea');

    if(parseInt(textArea.style.fontSize)>5){
        textArea.style.fontSize = (parseInt(textArea.style.fontSize)-1).toString() + 'px';
    }
}


/************************************

 generate note

 *************************************/

var btn = document.querySelector('#generate');
var noteList = [];
btn.addEventListener('click', function (e) {
    createNote();
});

function createNote(id , top, left, w, h, text) {
    var note = createElement('DIV');
    var section = createElement('SECTION');
    var textarea = createElement('TEXTAREA');
    textarea.style.height = '100px';
    textarea.style.width = '150px';
    textarea.style.fontSize = '10px';

    // create note with params, this will be called from UNDO action
    if (id && top && left && w && h && text) {
        note.setAttribute('id', id);
        note.style.top = top;
        note.style.left = left;
//        textarea.style.width = w;
//        textarea.style.height = h;
        textarea.value = text;
    }else{
        // initial creation of note
        var primaryKey = parseInt(localStorage.getItem('primaryKey'));
        note.setAttribute('id', 'note-' + (++primaryKey).toString());
        localStorage.setItem('primaryKey',primaryKey.toString());

    }

    // close button
    var closeButton = createElement('SPAN');
    closeButton.setAttribute('class', 'close-btn');
    closeButton.addEventListener('click',closeNote);
    closeButton.appendChild(document.createTextNode('x'));

    var zoomButton = createElement('SPAN');
    zoomButton.setAttribute('class', 'zoom-btn');
    zoomButton.addEventListener('click',zoomNote);
    zoomButton.appendChild(document.createTextNode('+'));

    var smallButton = createElement('SPAN');
    smallButton.setAttribute('class', 'small-btn');
    smallButton.addEventListener('click',smallNote);
    smallButton.appendChild(document.createTextNode('-'));

    note.setAttribute('class', 'wrapper');

    section.setAttribute('class', 'container');


    section.appendChild(textarea);
    section.appendChild(closeButton);
    section.appendChild(zoomButton);
    section.appendChild(smallButton);

    note.appendChild(section);
    noteList.push(note);
    note.style.zIndex = noteList.length;
    document.querySelector('body').appendChild(note);
}


/******************
 *
 *      Helper
 *
 ******************/
// Bring obj you clicked to front
// 1. remove clicked note from noteList and push to the same noteList again (change the order)
// 2. set z-index again follow noteList array order to move note clicked to top z-index
function bringToFront(clickedObj) {

    for (var i = 0; i < noteList.length; i++) {
        if (noteList[i].id == clickedObj.id) {
            noteList.push(noteList.splice(i, 1)[0]);

            for (i = 0; i < noteList.length; i++) {
                noteList[i].style.zIndex = i;
            }
            break;
        }
    }
}



function setAttributes(el, args) {
    for (var key in args) {
        el.setAttribute(key, args[key]);
    }
}

function createElement(el) {
    var el = el || 'DIV';
    return document.createElement(el);
}

function findParent(e, key) {
    // traverse parent until reach "null"
    var parent = e.target || e; // set target itself as a default

    while (parent != null) {
        if (parent.className.search(key) != -1 || parent.id.search(key) != -1) {
            return parent;
        } else {
            parent = parent.parentNode;
        }
    }
    return false;
}


