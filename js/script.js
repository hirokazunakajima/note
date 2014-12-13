/******************

 check local storage availability

 *******************/

//"use strict";

window.onload = function () {

    if (isLocalStorage()) {
        console.log('localStorage OK');

        // load saved data last time
        for(var i =0;i<localStorage.length;i++)
        {
            var pattern = /^note-\d+$/;
            if(pattern.test(localStorage.key(i))){
                console.log(localStorage.key(i));
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

/******************

 mouse related event

 *******************/

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

    if (target.className.search('^wrapper$') != -1) {

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
        if (noteList.length > 1) bringToFront(targetNote);
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

            var undoArea = createElement('DIV');
            undoArea.setAttribute('class','undo-wrapper');
//            setAttributes(undoArea, {'class': 'undo-wrapper', 'data-id': targetNote.id});
            undoArea.style.width = s.width;
            undoArea.style.height = s.height;
            var offset = 20;
            undoArea.style.top = (parseInt(targetNote.style.top) + offset).toString() + 'px';
            undoArea.style.left = (parseInt(targetNote.style.left) + offset).toString() + 'px';

            var undoButton = createElement('button');
            var textUndo = document.createTextNode('UNDO');
            setAttributes(undoButton, {'class': 'undo-button', 'data-id': targetNote.id});

            undoButton.appendChild(textUndo);
            undoArea.appendChild(undoButton);

            var deleteButton = createElement('button');
            var textDelete = document.createTextNode('DELETE');
            setAttributes(deleteButton, {'class': 'delete-btn', 'id': targetNote.id}); // use the same id as note to delete button, this gonna be key for local strage
            deleteButton.appendChild(textDelete);
            undoArea.appendChild(deleteButton);

            document.querySelector('body').appendChild(undoArea); // add undo area

//            undoAreaList.push(undoArea);

            undoButton.addEventListener('click', undoData);
            deleteButton.addEventListener('click', deleteData);
        }

        document.querySelector('body').removeChild(targetNote);
        noteList.splice(noteList.indexOf(targetNote), 1); // remove element from noteList

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

function undoData(e) {

    if (e.target.className == 'undo-button') {

        var undoButton = e.target;
        var dataId = undoButton.getAttribute('data-id');
        var d = JSON.parse(localStorage.getItem(dataId));
        createNote(d.id, d.top, d.left, d.width, d.height, d.text);

        var targetNote = findParent(e, 'undo-wrapper');
        document.querySelector('body').removeChild(targetNote); // remove undo area
    }
}

function deleteData(e) {

    if (e.target.className == 'delete-btn') {

        // remove undo area including undo text
        var undoWrapper = findParent(e, 'undo-wrapper');
        document.querySelector('body').removeChild(undoWrapper); // remove undo area
//        undoAreaList.splice(undoAreaList.indexOf(undoWrapper), 1);
        localStorage.removeItem(e.target.id); // remove data from local storage
    }
}

/******************

 generate note

 *******************/

var btn = document.querySelector('#generate');
var noteList = [];
//var undoAreaList = [];
btn.addEventListener('click', function (e) {
    createNote();
});

function createNote(id , top, left, w, h, text) {
    var note = createElement('DIV');
    var section = createElement('SECTION');
    var textarea = createElement('TEXTAREA');

    // create note with params, this will be called from UNDO action
    if (id && top && left && w && h && text) {
        note.setAttribute('id', id);
        note.style.top = top;
        note.style.left = left;
        textarea.style.width = w;
        textarea.style.height = h;
        textarea.value = text;
    }else{
        // initial creation of note
        note.setAttribute('id', 'note-' + noteList.length);
    }

    var span = createElement('SPAN');
    var textX = document.createTextNode('-');

    note.setAttribute('class', 'wrapper');

    section.setAttribute('class', 'container');
    span.setAttribute('class', 'close-btn');

    section.appendChild(textarea);
    section.appendChild(span);
    span.appendChild(textX);

    note.appendChild(section);
    noteList.push(note);
    note.style.zIndex = noteList.length;
    document.querySelector('body').appendChild(note);
}

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


/******************
 *
 *      Helper
 *
 ******************/
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


