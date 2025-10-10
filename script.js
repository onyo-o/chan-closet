const canvas = new fabric.Canvas('outfitCanvas', { preserveObjectStacking: true });
    const defaultBg = "images/background/bg1.png";

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
    let items = { tops: [], bottoms: [], shoes: [], accessories: [], stickers: [], background: [] };

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
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    });

    function downloadOutfit() {
      const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'chan-outfit.png';
      link.click();
    }
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
      actionsDiv.style.left = `${left - actionsDiv.offsetWidth / 2}px`;
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

    canvas.on('selection:created', e => {
      const obj = e.selected[0];
      updateActionPosition(obj);
      updateActionButtons(obj);
      actionsDiv.style.display = 'flex';
    });
    canvas.on('selection:updated', e => {
      const obj = e.selected[0];
      updateActionPosition(obj);
      updateActionButtons(obj);
      actionsDiv.style.display = 'flex';
    });
    canvas.on('selection:cleared', () => {
      actionsDiv.style.display = 'none';
    });
    canvas.on('object:moving', e => updateActionPosition(e.target));
    canvas.on('object:scaling', e => updateActionPosition(e.target));
    canvas.on('object:rotating', e => updateActionPosition(e.target));

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

    fetch('./items.json')
      .then(r => r.json())
      .then(json => {
        items = json;
      })
      .catch(err => {
        console.warn('Could not load items.json', err);
      });