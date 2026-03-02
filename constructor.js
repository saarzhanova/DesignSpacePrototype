const draggables = [...document.querySelectorAll('.draggable')];
const holders = [...document.querySelectorAll('.dropholder')];
const stOptions = document.getElementById('stOptions');
const rOptions = document.getElementById('rOptions');
const rtOptions = document.getElementById('rtOptions');
const sOptions = document.getElementById('sOptions');
const space = document.getElementById('space');
const rtJuxt = document.getElementById('rt-juxt');
const rtEmb = document.getElementById('rt-emb');

let isEmb = true;
let isJuxt = false;

// RT
let isStorylines = false;
let isTimelines = false;


const startPos = {};

draggables.forEach(dimensionIcon => {
    const parent = dimensionIcon.offsetParent; // to find coordinated we need to know where it's located as it's absolute
    const dimensionIconRect = dimensionIcon.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    startPos[dimensionIcon.id] = {
        left: dimensionIconRect.left - parentRect.left,
        top: dimensionIconRect.top - parentRect.top,
    };

    dimensionIcon.setAttribute('draggable', 'true');
});

const holderState = Object.fromEntries(holders.map(z => [z.id, null]));
const dimensionsState = Object.fromEntries(draggables.map(i => [i.id, null]));

draggables.forEach(dimensionIcon => {
    dimensionIcon.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', dimensionIcon.id);
        e.dataTransfer.setDragImage(dimensionIcon, dimensionIcon.width / 2, dimensionIcon.height / 2);
    });
});

holders.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('over'));

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('over');

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;

        handleDropIntoHolder(zone.id, draggedId);
    });
});

draggables.forEach(dimensionIcon => {
    dimensionIcon.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dimensionIcon.addEventListener('drop', (e) => {
        e.preventDefault();

        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;

        const targetHolderId = dimensionsState[dimensionIcon.id];
        if (!targetHolderId) return;

        handleDropIntoHolder(targetHolderId, draggedId);
    });
});

function handleDropIntoHolder(targetHolderId, draggedId) {
    const occupantId = holderState[targetHolderId];
    const fromHolderId = dimensionsState[draggedId];

    if (fromHolderId === targetHolderId) return;

    if (occupantId) {
        if (fromHolderId) {
            holderState[targetHolderId] = draggedId;
            dimensionsState[draggedId] = targetHolderId;

            holderState[fromHolderId] = occupantId;
            dimensionsState[occupantId] = fromHolderId;

            snapToCenter(document.getElementById(draggedId), document.getElementById(targetHolderId));
            snapToCenter(document.getElementById(occupantId), document.getElementById(fromHolderId));
        } else {
            holderState[targetHolderId] = draggedId;
            dimensionsState[draggedId] = targetHolderId;

            dimensionsState[occupantId] = null;
            movedimensionIconToStart(occupantId);

            snapToCenter(document.getElementById(draggedId), document.getElementById(targetHolderId));
        }

        logStateAndCombination();
        return;
    }

    if (fromHolderId) holderState[fromHolderId] = null;

    holderState[targetHolderId] = draggedId;
    dimensionsState[draggedId] = targetHolderId;

    snapToCenter(document.getElementById(draggedId), document.getElementById(targetHolderId));
    logStateAndCombination();
}

function snapToCenter(dimensionIconEl, zoneEl) {
    const parent = dimensionIconEl.offsetParent;
    const zoneRect = zoneEl.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const dimensionIconRect = dimensionIconEl.getBoundingClientRect();
    const w = dimensionIconRect.width;
    const h = dimensionIconRect.height;

    const left = (zoneRect.left - parentRect.left) + (zoneRect.width - w) / 2;
    const top  = (zoneRect.top  - parentRect.top)  + (zoneRect.height - h) / 2;

    dimensionIconEl.style.position = 'absolute';
    dimensionIconEl.style.left = `${left}px`;
    dimensionIconEl.style.top = `${top}px`;
}

function movedimensionIconToStart(dimensionIconId) {
    const el = document.getElementById(dimensionIconId);
    el.style.position = 'absolute';
    el.style.left = `${startPos[dimensionIconId].left}px`;
    el.style.top = `${startPos[dimensionIconId].top}px`;
}

logStateAndCombination();

function logStateAndCombination() {
    const emptyHolders = Object.keys(holderState).filter(h => holderState[h] === null);
    const filled = Object.entries(holderState).filter(([_, v]) => v !== null);

    let isST = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === 't') || (holderState['dimensionsHolder3'] === 't' && holderState['dimensionsHolder4'] === 's');
    let isR = (holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === null) || (holderState['dimensionsHolder2'] === 'r' && holderState['dimensionsHolder1'] === null);
    let isRT = (holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === 't') || (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === 'r');
    let isS = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === null) || (holderState['dimensionsHolder4'] === 's' && holderState['dimensionsHolder3'] === null);

    if (isST) showSTOptions(); else hideSTOptions();
    if (isR) showROptions(); else hideROptions();
    if (isRT) showRTOptions(); else hideRTOptions();
    if (isS) showSOptions(); else hideSOptions();


    if (isRT && isS) {
        if (isStorylines) {
            if (isJuxt) showRTStorylinesJuxt();
            if (isEmb) showRTStorylinesEmb();
        }
    } else {
        hideRTStorylinesJuxt();
        hideRTStorylinesEmb();
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// emb / juxt

const embOff = document.getElementById('embOff');
const embOn = document.getElementById('embOn');
const juxtOff = document.getElementById('juxtOff');
const juxtOn = document.getElementById('juxtOn');

embOn.style.display = 'block';
juxtOn.style.display = 'none';

embOff.addEventListener('click', () => {
    juxtOn.style.display = 'none';
    embOn.style.display = 'block';
    switchToEmb();
    logStateAndCombination();
});

juxtOff.addEventListener('click', () => {
    embOn.style.display = 'none';
    juxtOn.style.display = 'block';
    switchToJuxt()
    logStateAndCombination();
});

function switchToEmb() {
    isEmb = true;
    isJuxt = false;
}

function switchToJuxt() {
    isEmb = false;
    isJuxt = true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// ST

function showSTOptions() {
    stOptions.style.display = 'block';
}

function hideSTOptions() {
    stOptions.style.display = 'none';
}

const stEmbOff= document.getElementById('stEmbOff');
const stJuxtOff= document.getElementById('stJuxtOff');
const stEncOff= document.getElementById('stEncOff');
const stEmbOn= document.getElementById('stEmbOn');
const stJuxtOn= document.getElementById('stJuxtOn');
const stEncOn= document.getElementById('stEncOn');

stEmbOn.style.display = 'none';
stJuxtOn.style.display = 'none';
stEncOn.style.display = 'none';

stEmbOff.addEventListener('click', () => {
    stEmbOn.style.display = 'block';
    stJuxtOn.style.display = 'none';
    stEncOn.style.display = 'none';
});
stJuxtOff.addEventListener('click', () => {
    stEmbOn.style.display = 'none';
    stJuxtOn.style.display = 'block';
    stEncOn.style.display = 'none';
});
stEncOff.addEventListener('click', () => {
    stEmbOn.style.display = 'none';
    stJuxtOn.style.display = 'none';
    stEncOn.style.display = 'block';
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// R
function showROptions() {
    rOptions.style.display = 'block';
    rtOptions.style.display = 'none';
}

function hideROptions() {
    rOptions.style.display = 'none';
}

const hypergraphOn = document.getElementById('hypergraphIconOn');
const hypergraphOff = document.getElementById('hypergraphIconOff');

hypergraphOn.style.display = 'none';

hypergraphOff.addEventListener('click', () => {
    hypergraphOn.style.display = 'block';
})
hypergraphOn.addEventListener('click', () => {
    hypergraphOn.style.display = 'none';
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// RT
const storylinesIconOff = document.getElementById('storylinesIconOff');
const timelinesIconOff = document.getElementById('timelinesIconOff');
const storylinesIconOn = document.getElementById('storylinesIconOn');
const timelinesIconOn = document.getElementById('timelinesIconOn');

storylinesIconOff.addEventListener('click', () => {
    switchRTStorylinesOptions();
})
timelinesIconOff.addEventListener('click', () => {
    switchRTTimelinesOptions();
})

function showRTOptions() {
    rtOptions.style.display = 'block';
    rOptions.style.display = 'none';
}
function hideRTOptions() {
    rtOptions.style.display = 'none';
}

function switchRTStorylinesOptions() {
    storylinesIconOn.style.display = 'block';
    timelinesIconOn.style.display = 'none';
    isStorylines = true;
    isTimelines = false;
    logStateAndCombination();
}
function switchRTTimelinesOptions() {
    storylinesIconOn.style.display = 'none';
    timelinesIconOn.style.display = 'block';
    isTimelines = true;
    isStorylines = false;
    logStateAndCombination();
}
function showRTStorylinesJuxt() {
    showSpace();
    rtJuxt.style.display = 'block';
    rtEmb.style.display = 'none';
}
function hideRTStorylinesJuxt() {
    rtJuxt.style.display = 'none';
}
function hideRTStorylinesEmb() {
    rtEmb.style.display = 'none';
}
function showRTStorylinesEmb() {
    showSpace();
    rtEmb.style.display = 'block';
    rtJuxt.style.display = 'none';
}
function showSpace() {
    space.style.display = 'block';
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// S
function showSOptions() {
    sOptions.style.display = 'block';
    space.style.display = 'block';
}

function hideSOptions() {
    sOptions.style.display = 'none';
    space.style.display = 'none';
}
