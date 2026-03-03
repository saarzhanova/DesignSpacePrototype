const draggables = [...document.querySelectorAll('.draggable')];
const holders = [...document.querySelectorAll('.dropholder')];
const stOptions = document.getElementById('stOptions');
const rOptions = document.getElementById('rOptions');
const rtOptions = document.getElementById('rtOptions');
const sOptions = document.getElementById('sOptions');
const space = document.getElementById('space');
const rtJuxtStory = document.getElementById('rt-juxt-story');
const rtJuxtTime = document.getElementById('rt-juxt-time');
const rtEmbStory = document.getElementById('rt-emb-story');
const rtEmbTime = document.getElementById('rt-emb-time');
const imageHolder = document.getElementById('imageHolder');
const rJuxtGraph = document.getElementById('r-juxt-graph');
const rJuxtDict = document.getElementById('r-juxt-dict');
const rJuxtMatrix = document.getElementById('r-juxt-matrix');
const rEmbGraph = document.getElementById('r-emb-graph');
const rEmbDict = document.getElementById('r-emb-dict');
const rEmbMatrix = document.getElementById('r-emb-matrix');
const rJuxtGraphEnc = document.getElementById('r-juxt-graph-enc');
const rJuxtDictEnc = document.getElementById('r-juxt-dict-enc');
const rJuxtMatrixEnc = document.getElementById('r-juxt-matrix-enc');
const rEmbGraphEnc = document.getElementById('r-emb-graph-enc');
const rEmbDictEnc = document.getElementById('r-emb-dict-enc');
const rEmbMatrixEnc = document.getElementById('r-emb-matrix-enc');
const tEmbS = document.getElementById('t-emb-s');
const tJuxtS = document.getElementById('t-juxt-s');

imageHolder.style.display = 'none';

let isEmb = true;
let isJuxt = false;

// RT
let isStorylines = false;
let isTimelines = false;

// R
let isHypergraph = false;
let isDict = false;
let isMatrix = false;

// ST
let isTembS = false;
let isTjuxtS = false;
let isTencS = false;


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
    let isT = (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === null) || (holderState['dimensionsHolder2'] === 't' && holderState['dimensionsHolder1'] === null);
    let isRT = (holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === 't') || (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === 'r');
    let isS = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === null) || (holderState['dimensionsHolder4'] === 's' && holderState['dimensionsHolder3'] === null);

    if (isST) showSTOptions(); else hideSTOptions();
    if (isR) showROptions(); else hideROptions();
    if (isRT) showRTOptions(); else hideRTOptions();
    if (isS) showSOptions(); else hideSOptions();

    // RT-S
    if (isRT && isS) {
        if (isStorylines) {
            hideTimelinesJuxt();
            hideTimelinesEmb();
            if (isJuxt) showStorylinesJuxt();
            if (isEmb) showStorylinesEmb();
        }
        if (isTimelines) {
            hideStorylinesJuxt();
            hideStorylinesEmb();
            if (isJuxt) showTimelinesJuxt();
            if (isEmb) showTimelinesEmb();
        }
        imageHolder.style.display = 'block';
    } else {
        imageHolder.style.display = 'none';
        hideStorylinesJuxt();
        hideStorylinesEmb();
        hideTimelinesJuxt();
        hideTimelinesEmb();
    }
    // R-ST

    if (isR) {
        hideTembS();
        hideTjuxtS();
        imageHolder.style.display = 'block';
        if (isHypergraph) {
            hideDictEmb();
            hideDictJuxt();
            hideMatrixEmb();
            hideMatrixJuxt();
            if (isJuxt) showHypergraphJuxt();
            if (isEmb) showHypergraphEmb();
        } else if (isDict) {
            hideMatrixEmb();
            hideMatrixJuxt();
            hideHypergraphEmb();
            hideHypergraphJuxt();
            if (isJuxt) showDictJuxt();
            if (isEmb) showDictEmb();
        } else if (isMatrix) {
            hideDictJuxt();
            hideDictEmb();
            hideHypergraphJuxt();
            hideHypergraphEmb();
            if (isJuxt) showMatrixJuxt();
            if (isEmb) showMatrixEmb();
        }
        if (isST) {
            if (isTembS && (isHypergraph || isDict || isMatrix)) {
                showTembS();
                imageHolder.style.display = 'block';
            } else if (isTjuxtS && (isHypergraph || isDict || isMatrix)) {
                showTjuxtS();
                imageHolder.style.display = 'block';
            } else if (isTencS && (isHypergraph || isDict || isMatrix)) {
                if (isHypergraph) {
                    if (isJuxt) showHypergraphJuxtEnc();
                    if (isEmb) showHypergraphEmbEnc()
                } else if (isDict) {
                    if (isJuxt) showDictJuxtEnc();
                    if (isEmb) showDictEmbEnc();
                } else if (isMatrix) {
                    if (isJuxt) showMatrixJuxtEnc();
                    if (isEmb) showMatrixEmbEnc();
                } else {
                    showSpace();
                    hideTjuxtS();
                    hideTembS();
                }
                imageHolder.style.display = 'block';
            } else {
                imageHolder.style.display = 'none';
            }
        }
    } else {
        hideDictJuxt();
        hideDictEmb();
        hideMatrixJuxt();
        hideMatrixEmb();
        hideHypergraphJuxt();
        hideHypergraphEmb();
        hideTembS();
        hideTjuxtS();
    }

    // is T-S
    if (isT && isS) {
        showSTOptions();
        hideSOptions();
        if (isTembS) {
            showTembS();
            imageHolder.style.display = 'block';
        } else if (isTjuxtS) {
            showTjuxtS();
            imageHolder.style.display = 'block';
        } else if (isTencS) {
                showSpace();
                hideTjuxtS();
                hideTembS();
            imageHolder.style.display = 'block';
        } else {
            imageHolder.style.display = 'none';
        }
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
    isTembS = true;
    isTjuxtS = false;
    isTencS = false;
    logStateAndCombination();
});
stJuxtOff.addEventListener('click', () => {
    stEmbOn.style.display = 'none';
    stJuxtOn.style.display = 'block';
    stEncOn.style.display = 'none';
    isTembS = false;
    isTjuxtS = true;
    isTencS = false;
    logStateAndCombination();
});
stEncOff.addEventListener('click', () => {
    stEmbOn.style.display = 'none';
    stJuxtOn.style.display = 'none';
    stEncOn.style.display = 'block';
    isTembS = false;
    isTjuxtS = false;
    isTencS = true;
    logStateAndCombination();
});
// ST options
function showSTOptions() {
    stOptions.style.display = 'block';
}
function hideSTOptions() {
    stOptions.style.display = 'none';
}
// ST display
//emb
function showTembS() {
    // hide other T
    hideTjuxtS();
    hideAllEnc();

    showSpace();
    tEmbS.style.display = 'block';
}
function hideTembS() {
    tEmbS.style.display = 'none';
}
//juxt
function showTjuxtS() {
    // hide other T
    hideTembS();
    hideAllEnc();

    showSpace();
    tJuxtS.style.display = 'block';
}
function hideTjuxtS() {
    showSpace();
    tJuxtS.style.display = 'none';
}
//enc juxt
function showHypergraphJuxtEnc() {
    //hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideHypergraphJuxt();

    // hide other juxt
    hideMatrixJuxtEnc();
    hideDictJuxtEnc();

    // hide emb
    hideHypergraphEmbEnc();
    hideDictEmbEnc();
    hideMatrixEmbEnc();

    showSpace();
    rJuxtGraphEnc.style.display = 'block';
}
function hideHypergraphJuxtEnc() {
    rJuxtGraphEnc.style.display = 'none';
}
function showDictJuxtEnc() {
    //hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideDictJuxt();

    // hide other juxt
    hideHypergraphJuxtEnc();
    hideMatrixJuxtEnc();

    // hide emb
    hideHypergraphEmbEnc();
    hideDictEmbEnc();
    hideMatrixEmbEnc();

    showSpace();
    rJuxtDictEnc.style.display = 'block';
}
function hideDictJuxtEnc() {
    rJuxtDictEnc.style.display = 'none';
}
function showMatrixJuxtEnc() {
    //hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideMatrixJuxt();

    // hide other juxt
    hideHypergraphJuxtEnc();
    hideDictJuxtEnc();

    // hide emb
    hideHypergraphEmbEnc();
    hideDictEmbEnc();
    hideMatrixEmbEnc();

    showSpace();
    rJuxtMatrixEnc.style.display = 'block';
}
function hideMatrixJuxtEnc() {
    rJuxtMatrixEnc.style.display = 'none';
}
// enc emb
function showHypergraphEmbEnc() {
    // hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideHypergraphJuxt();

    // hide other emb
    hideDictEmbEnc();
    hideMatrixEmbEnc();

    // hide juxt
    hideHypergraphJuxtEnc();
    hideDictJuxtEnc();
    hideMatrixJuxtEnc();

    showSpace();
    rEmbGraphEnc.style.display = 'block';
}
function hideHypergraphEmbEnc() {
    rEmbGraphEnc.style.display = 'none';
}
function showDictEmbEnc() {
    // hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideDictJuxt();

    //hide other emb
    hideHypergraphEmbEnc();
    hideMatrixEmbEnc();

    // hide juxt
    hideHypergraphJuxtEnc();
    hideDictJuxtEnc();
    hideMatrixJuxtEnc();

    showSpace();
    rEmbDictEnc.style.display = 'block';
}
function hideDictEmbEnc() {
    rEmbDictEnc.style.display = 'none';
}
function showMatrixEmbEnc() {
    // hide time
    hideTjuxtS();
    hideTembS();

    // hide R
    hideMatrixJuxt();

    //hide other emb
    hideDictEmbEnc();
    hideHypergraphEmbEnc();

    // hide juxt
    hideHypergraphJuxtEnc();
    hideDictJuxtEnc();
    hideMatrixJuxtEnc();

    showSpace();
    rEmbMatrixEnc.style.display = 'block';
}
function hideMatrixEmbEnc() {
    rEmbMatrixEnc.style.display = 'none';
}
function hideAllEnc() {
    hideHypergraphEmbEnc();
    hideHypergraphJuxtEnc();
    hideMatrixJuxtEnc();
    hideMatrixEmbEnc();
    hideDictEmbEnc();
    hideDictJuxtEnc();
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// R
const hypergraphOn = document.getElementById('hypergraphIconOn');
const hypergraphOff = document.getElementById('hypergraphIconOff');
const dictOn = document.getElementById('dictIconOn');
const dictOff = document.getElementById('dictIconOff');
const matrixOn = document.getElementById('matrixIconOn');
const matrixOff = document.getElementById('matrixIconOff');

hypergraphOff.addEventListener('click', () => {
    hypergraphOn.style.display = 'block';
    dictOn.style.display = 'none';
    matrixOn.style.display = 'none';
    isHypergraph = true;
    isDict = false;
    isMatrix = false;
    logStateAndCombination();
});
dictOff.addEventListener('click', () => {
    dictOn.style.display = 'block';
    matrixOn.style.display = 'none';
    hypergraphOn.style.display = 'none';
    isHypergraph = false;
    isDict = true;
    isMatrix = false;
    logStateAndCombination();
});
matrixOff.addEventListener('click', () => {
    matrixOn.style.display = 'block';
    dictOn.style.display = 'none';
    hypergraphOn.style.display = 'none';
    isHypergraph = false;
    isDict = false;
    isMatrix = true;
    logStateAndCombination();
});
// R options
function showROptions() {
    rOptions.style.display = 'block';
    rtOptions.style.display = 'none';
}

function hideROptions() {
    rOptions.style.display = 'none';
}
// R display
//Hypergraph
function showHypergraphJuxt() {
    showSpace();
    rJuxtGraph.style.display = 'block';
    hideHypergraphEmb();
}
function hideHypergraphJuxt() {
    rJuxtGraph.style.display = 'none';
}
function showHypergraphEmb() {
    showSpace();
    rEmbGraph.style.display = 'block';
    hideHypergraphJuxt();
}
function hideHypergraphEmb() {
    rEmbGraph.style.display = 'none';
}
//Dict
function showDictJuxt() {
    showSpace();
    rJuxtDict.style.display = 'block';
    hideDictEmb();
}
function hideDictJuxt() {
    rJuxtDict.style.display = 'none';
}
function showDictEmb() {
    showSpace();
    rEmbDict.style.display = 'block';
    hideDictJuxt();
}
function hideDictEmb() {
    rEmbDict.style.display = 'none';
}
//Matrix
function showMatrixJuxt() {
    showSpace();
    rJuxtMatrix.style.display = 'block';
    hideMatrixEmb();
}
function hideMatrixJuxt() {
    rJuxtMatrix.style.display = 'none';
}
function showMatrixEmb() {
    showSpace();
    rEmbMatrix.style.display = 'block';
    hideMatrixJuxt();
}
function hideMatrixEmb() {
    rEmbMatrix.style.display = 'none';
}
//R emb TencS
function showHypergraphEnc() {
    console.log('showHypergraphEnc')
}
function hideHypergraphEnc() {
    console.log('hideHypergraphEnc')
}
function showDictEnc() {
    console.log('showDictEnc')
}
function hideDictEnc() {
    console.log('hideDictEnc')
}
function showMatrixEnc() {
    console.log('showMatrixEnc')
}
function hideMatrixEnc() {
    console.log('hideMatrixEnc')
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// RT
const storylinesIconOff = document.getElementById('storylinesIconOff');
const timelinesIconOff = document.getElementById('timelinesIconOff');
const storylinesIconOn = document.getElementById('storylinesIconOn');
const timelinesIconOn = document.getElementById('timelinesIconOn');

storylinesIconOff.addEventListener('click', () => {
    switchStorylinesOptions();
})
timelinesIconOff.addEventListener('click', () => {
    switchTimelinesOptions();
})

//RT options
function showRTOptions() {
    rtOptions.style.display = 'block';
    rOptions.style.display = 'none';
}
function hideRTOptions() {
    rtOptions.style.display = 'none';
}
function switchStorylinesOptions() {
    storylinesIconOn.style.display = 'block';
    timelinesIconOn.style.display = 'none';
    isStorylines = true;
    isTimelines = false;
    logStateAndCombination();
}
function switchTimelinesOptions() {
    storylinesIconOn.style.display = 'none';
    timelinesIconOn.style.display = 'block';
    isTimelines = true;
    isStorylines = false;
    logStateAndCombination();
}
// RT display
//Storylines juxt
function showStorylinesJuxt() {
    showSpace();
    rtJuxtStory.style.display = 'block';
    rtEmbStory.style.display = 'none';
}
function hideStorylinesJuxt() {
    rtJuxtStory.style.display = 'none';
}
function showTimelinesJuxt() {
    showSpace();
    rtJuxtTime.style.display = 'block';
    rtEmbTime.style.display = 'none';
}
function hideTimelinesJuxt() {
    rtJuxtTime.style.display = 'none';
}
//Storylines emb
function showStorylinesEmb() {
    showSpace();
    rtEmbStory.style.display = 'block';
    rtJuxtStory.style.display = 'none';
}
function hideStorylinesEmb() {
    rtEmbStory.style.display = 'none';
}
function showTimelinesEmb() {
    showSpace();
    rtEmbTime.style.display = 'block';
    rtJuxtTime.style.display = 'none';
}
function hideTimelinesEmb() {
    rtEmbTime.style.display = 'none';
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
// S display
function showSpace() {
    space.style.display = 'block';
}
