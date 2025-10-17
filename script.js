//Canvas Setup
const canvas = new fabric.Canvas('outfitCanvas', { preserveObjectStacking: true });
const defaultBg = "images/background/bg1.png";
let items = { tops: [], bottoms: [], shoes: [], accessories: [], stickers: [], background: [] };

//Load Default Canvas Background
function setCanvasBackground(src = defaultBg) {
    fabric.Image.fromURL(defaultBg, function (img) {
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let scale = imgRatio > canvasRatio ? canvas.height / img.height : canvas.width / img.width;

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            originX: 'left',
            originY: 'top',
            scaleX: scale,
            scaleY: scale,
        });
    }, { crossOrigin: 'anonymous' });
}

setCanvasBackground();


//Category and Item Loading
function showCategory(cat) {
    document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    const carousel = document.getElementById('carousel');
    carousel.innerHTML = '';

    const arr = items[cat] || [];
    arr.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = src.split('/').pop();
        img.onclick = () => addToCanvas(src);
        carousel.appendChild(img);
    });
    if (arr.length === 0) {
        carousel.innerHTML = '<em style="padding:10px;color:#666">No items in this category.</em>';
    }
}


//Add Image to Canvas
function addToCanvas(src) {
    const activeBtn = document.querySelector('.toolbar button.active');
    const activeCat = activeBtn ? activeBtn.textContent.toLowerCase() : '';

    if (activeCat === 'background') {
        fabric.Image.fromURL(src, function (img) {
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let scale;

            if (imgRatio > canvasRatio) {
                scale = canvas.height / img.height;
            } else {
                scale = canvas.width / img.width;
            }
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                originX: 'left',
                originY: 'top',
                scaleX: scale,
                scaleY: scale,
            });
        }, { crossOrigin: 'anonymous' });
        return;
    }

    fabric.Image.fromURL(src, function (img) {
        const scale = Math.min(300 / img.width, 300 / img.height, 0.6);
        img.set({
            originX: 'center',
            originY: 'center',
            left: canvas.width / 2 + (Math.random() - 0.5) * 100,
            top: canvas.height / 2 + (Math.random() - 0.5) * 100,
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            cornerStyle: 'circle',
            padding: 5,
            lockUniScaling: true
        });
        img.name = `Image ${canvas.getObjects().length}`;
        img.setControlsVisibility({
            ml: false,
            mr: false,
            mt: false,
            mb: false
        });
        img.lockScalingFlip = true;
        canvas.add(img).setActiveObject(img);
        canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
}


//Basic Actions
function deleteSelected() {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
}

function duplicateSelected() {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.clone(cloned => {
        cloned.set({
            left: obj.left + 20,
            top: obj.top + 20,
            cornerStyle: 'circle',
            padding: 5,
            lockUniScaling: true,
            lockScalingFlip: true
        });

        cloned.setControlsVisibility({
            ml: false,
            mr: false,
            mt: false,
            mb: false
        });

        canvas.add(cloned).setActiveObject(cloned);
        canvas.requestRenderAll();
    });
}


function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        canvas.clear();

        setCanvasBackground();
    }
}

function downloadOutfit() {
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'chan-outfit.png';
    link.click();
}

//Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
});

//Action Btn Panel
const actionsDiv = document.getElementById('itemActions');
const delBtn = document.getElementById('delBtn');
const lockBtn = document.getElementById('lockBtn');
const flipBtn = document.getElementById('flipBtn');
const dupBtn = document.getElementById('dupBtn');


function updateActionPosition(obj) {
    if (!obj) return;
    const rect = canvas.getElement().getBoundingClientRect();
    const center = obj.getCenterPoint();
    const p = canvas.viewportTransform;
    const left = rect.left + center.x * p[0] + p[4];
    const top = rect.top + center.y * p[3] + p[5] - (obj.height * obj.scaleY / 2) + 8;
    actionsDiv.style.left = `${left - 75}px`;
    actionsDiv.style.top = `${top}px`;
}

function updateActionButtons(obj) {
    if (!obj) return;

    const locked = obj.lockMovementX;

    if (locked) {
        lockBtn.style.display = 'inline-block';
        delBtn.style.display = 'inline-block';
        flipBtn.style.display = 'none';
        dupBtn.style.display = 'none';
    } else {
        lockBtn.style.display = 'inline-block';
        delBtn.style.display = 'inline-block';
        flipBtn.style.display = 'inline-block';
        dupBtn.style.display = 'inline-block';
    }
}

//Canvas event handlers
canvas.on('selection:created', e => {
    const obj = e.selected[0];
    actionsDiv.style.display = 'flex';
    updateActionButtons(obj);
    requestAnimationFrame(() => updateActionPosition(obj));
});
canvas.on('selection:updated', e => {
    const obj = e.selected[0];
    actionsDiv.style.display = 'flex';
    updateActionButtons(obj);
    requestAnimationFrame(() => updateActionPosition(obj));
});
canvas.on('selection:cleared', () => {
    actionsDiv.style.display = 'none';
});
canvas.on('object:moving', e => updateActionPosition(e.target));
canvas.on('object:scaling', e => updateActionPosition(e.target));
canvas.on('object:rotating', e => updateActionPosition(e.target));

//Action btn logic
lockBtn.onclick = () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const locked = obj.lockMovementX;
    obj.set({
        lockMovementX: !locked,
        lockMovementY: !locked,
        lockScalingX: !locked,
        lockScalingY: !locked,
        lockRotation: !locked
    });
    obj.selectable = true;
    lockBtn.textContent = locked ? '🔒' : '🔓';
    updateActionButtons(obj);
    updateActionPosition(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
};

flipBtn.onclick = () => {
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.toggle('flipX');
    canvas.requestRenderAll();
    updateActionPosition(obj);
};

dupBtn.onclick = duplicateSelected;
delBtn.onclick = deleteSelected;

//Load items
fetch('./items.json')
    .then(r => r.json())
    .then(json => { items = json; })
    .catch(err => console.warn('Could not load items.json', err));

//Layer Panel Setup
const layerList = document.getElementById('layerList');

function updateLayerPanel() {
    layerList.innerHTML = '';

    // Get all non-background objects
    const objects = canvas.getObjects().filter(o => o !== canvas.backgroundImage);

    // Show topmost layer first
    objects.slice().reverse().forEach((obj, index) => {
        const li = document.createElement('li');
        li.dataset.index = objects.length - 1 - index;
        li.draggable = true;

        // Thumbnail
        if (obj.type === "image" && obj._element) {
            const thumb = document.createElement("img");
            thumb.className = "layer-thumb";
            thumb.src = obj._element.src;
            li.appendChild(thumb);
        }

        if (obj === canvas.getActiveObject()) li.classList.add("active");
        layerList.appendChild(li);
    });
}

// Auto-refresh layer list
canvas.on('selection:created', updateLayerPanel);
canvas.on('selection:updated', updateLayerPanel);
canvas.on('selection:cleared', updateLayerPanel);
canvas.on('object:added', updateLayerPanel);
canvas.on('object:removed', updateLayerPanel);
canvas.on('object:modified', updateLayerPanel);

// Click layer to select object
layerList.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    const index = parseInt(li.dataset.index);
    const obj = canvas.getObjects()[index];
    if (obj && obj !== canvas.backgroundImage) {
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        updateLayerPanel();
    }
});

// Drag-and-drop reordering
let dragSrc = null;

layerList.addEventListener('dragstart', e => {
    dragSrc = e.target.closest('li');
    e.dataTransfer.effectAllowed = 'move';
});

layerList.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

layerList.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('li');
    if (!target || target === dragSrc) return;

    const srcIndex = parseInt(dragSrc.dataset.index);
    const targetIndex = parseInt(target.dataset.index);

    const objs = canvas.getObjects().filter(o => o !== canvas.backgroundImage);
    const movedObj = objs[srcIndex];

    objs.splice(srcIndex, 1);
    objs.splice(targetIndex, 0, movedObj);

    // Rebuild canvas with new order
    canvas.getObjects().forEach(o => { if (o !== canvas.backgroundImage) canvas.remove(o); });
    objs.forEach(o => canvas.add(o));

    canvas.requestRenderAll();
    updateLayerPanel();
});
