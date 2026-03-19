// Space located all the visualisation in the center
// when there is no space, the visualisation appear on the side
// we must always display space or noSpace
//////////////////////////////////////////
const draggables = [...document.querySelectorAll('.draggable')];
const holders = [...document.querySelectorAll('.dropholder')];
const stOptions = document.getElementById('stOptions');
const rOptions = document.getElementById('rOptions');
const rtOptions = document.getElementById('rtOptions');
const sOptions = document.getElementById('sOptions');
const space = document.getElementById('space');
const noSpace = document.getElementById('noSpace');
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
const stEmbGraph = document.getElementById('st-emb-graph');
const stEmbDict = document.getElementById('st-emb-dict');
const stEmbMatrix = document.getElementById('st-emb-matrix');
const srEmbT = document.getElementById('sr-emb-t');
const srDictEmbT = document.getElementById('srDict-emb-t');
const srMatrixEmbT = document.getElementById('srMatrix-emb-t');
const srJuxtT = document.getElementById('sr-juxt-t');
const srDictJuxtT = document.getElementById('srDict-juxt-t');
const srMatrixJuxtT = document.getElementById('srMatrix-juxt-t');
const sEmbRT = document.getElementById('s-emb-rt');
const sEmbTimeline = document.getElementById('s-emb-rt-timeline');

imageHolder.style.display = 'none'

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

let isSpace = false;


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

    let isST_right = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === 't') || (holderState['dimensionsHolder3'] === 't' && holderState['dimensionsHolder4'] === 's');
    let isST_left = (holderState['dimensionsHolder1'] === 's' && holderState['dimensionsHolder2'] === 't') || (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === 's');
    let isST = (isST_right || isST_left);
    let isSR_left = (holderState['dimensionsHolder1'] === 's' && holderState['dimensionsHolder2'] === 'r') || (holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === 's');
    let isSR_right = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === 'r') || (holderState['dimensionsHolder3'] === 'r' && holderState['dimensionsHolder4'] === 's');
    let isT_only = (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === null) || (holderState['dimensionsHolder2'] === 't' && holderState['dimensionsHolder1'] === null);
    let isT_right = (holderState['dimensionsHolder3'] === 't' && holderState['dimensionsHolder4'] === null) || (holderState['dimensionsHolder4'] === 't' && holderState['dimensionsHolder3'] === null);
    let isT_left = (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === null) || (holderState['dimensionsHolder2'] === 't' && holderState['dimensionsHolder1'] === null);
    let isRT_left = (holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === 't') || (holderState['dimensionsHolder1'] === 't' && holderState['dimensionsHolder2'] === 'r');
    let isRT_right = (holderState['dimensionsHolder3'] === 'r' && holderState['dimensionsHolder4'] === 't') || (holderState['dimensionsHolder3'] === 't' && holderState['dimensionsHolder4'] === 'r');
    let isS_only = (holderState['dimensionsHolder3'] === 's' && holderState['dimensionsHolder4'] === null) || (holderState['dimensionsHolder4'] === 's' && holderState['dimensionsHolder3'] === null);
    let isS_left = (holderState['dimensionsHolder1'] === 's' || holderState['dimensionsHolder2'] === 's');
    let isS_right = (holderState['dimensionsHolder3'] === 's' || holderState['dimensionsHolder4'] === 's');
    let isS = Object.values(holderState).includes('s');
    let isT = Object.values(holderState).includes('t');
    let isR = Object.values(holderState).includes('r') && !isRT_left;
    let isR_left = ((holderState['dimensionsHolder1'] === 'r' && holderState['dimensionsHolder2'] === null) || (holderState['dimensionsHolder2'] === 'r' && holderState['dimensionsHolder1'] === null));
    let isR_right = (holderState['dimensionsHolder3'] === 'r' || holderState['dimensionsHolder4'] === 'r');

    if (isST_right) pickSTOptions(); else hideSTOptions();
    if (isRT_left) pickRTOptions(); else hideRTOptions();
    if (isR) pickROptions(); else hideROptions();
    if (isS && !isST) pickSOptions(); else hideSOptions();
    // if (isST_left) hideSpace();
    if (isS_right) {
        pickSpace();
    } else if (isS_left) {
        hideSpace();
    }

    // RT-S
    if (isRT_left && isS_right) {
        if (isStorylines) {
            hideTimelinesJuxt();
            hideTimelinesEmb();
            if (isJuxt) pickStorylinesJuxt();
            if (isEmb) pickStorylinesEmb();
        }
        if (isTimelines) {
            hideStorylinesJuxt();
            hideStorylinesEmb();
            if (isJuxt) pickTimelinesJuxt();
            if (isEmb) pickTimelinesEmb();
        }
        showVisualisation();
    } else {
        hideVisualisation();
        hideStorylinesJuxt();
        hideStorylinesEmb();
        hideTimelinesJuxt();
        hideTimelinesEmb();
    }
    // R-ST
    if (isR_left) {
        console.log('R left')
        hideTembS();
        hideTjuxtS();
        if (isHypergraph) {
            console.log('pick graph')
            hideDictEmb();
            hideDictJuxt();
            hideMatrixEmb();
            hideMatrixJuxt();
            if (isJuxt) pickHypergraphJuxt();
            if (isEmb) pickHypergraphEmb();
        } else if (isDict) {
            hideMatrixEmb();
            hideMatrixJuxt();
            hideHypergraphEmb();
            hideHypergraphJuxt();
            if (isJuxt) pickDictJuxt();
            if (isEmb) pickDictEmb();
        } else if (isMatrix) {
            hideDictJuxt();
            hideDictEmb();
            hideHypergraphJuxt();
            hideHypergraphEmb();
            if (isJuxt) pickMatrixJuxt();
            if (isEmb) pickMatrixEmb();
        }
        if (isS_only) {
            showVisualisation();
        }
        if (isST_right) {
            console.log('ST right')
            if (isTembS && (isHypergraph || isDict || isMatrix)) {
                console.log('pick embedding')
                pickTembS();
                showVisualisation();
            } else if (isTjuxtS && (isHypergraph || isDict || isMatrix)) {
                pickTjuxtS();
                showVisualisation();
            } else if (isTencS && (isHypergraph || isDict || isMatrix)) {
                if (isHypergraph) {
                    if (isJuxt) pickHypergraphJuxtEnc();
                    if (isEmb) pickHypergraphEmbEnc()
                } else if (isDict) {
                    if (isJuxt) pickDictJuxtEnc();
                    if (isEmb) pickDictEmbEnc();
                } else if (isMatrix) {
                    if (isJuxt) pickMatrixJuxtEnc();
                    if (isEmb) pickMatrixEmbEnc();
                } else {
                    pickSpace();
                    hideTjuxtS();
                    hideTembS();
                }
                showVisualisation();
            } else {
                hideVisualisation();
            }
        }
    } else {
        hideDictJuxt();
        hideDictEmb();
        hideMatrixJuxt();
        hideMatrixEmb();
        hideHypergraphJuxt();
        hideHypergraphEmb();
        // hideTembS();
        // hideTjuxtS();
        hideAllEnc();
    }

    // T-S
    if (isT_only && isS_only) {
        pickSTOptions();
        hideSOptions();
        if (isTembS) {
            pickTembS();
            showVisualisation();
        } else if (isTjuxtS) {
            pickTjuxtS();
            showVisualisation();
        } else if (isTencS) {
                pickSpace();
                hideTjuxtS();
                hideTembS();
            showVisualisation();
        } else {
            hideVisualisation();
        }
    }

    // T-SR
    if (isT_only && isSR_right) {
        showVisualisation();
        pickROptions();
        if (isHypergraph) {
            hideDictEmb();
            hideMatrixEmb();
            pickHypergraphEmb();

            if (isEmb) {
                pickTembS();
            } else if (isJuxt) {
                pickTjuxtS();
            }

        } else if (isDict) {
            hideMatrixEmb();
            hideHypergraphEmb();
            pickDictEmb();

            if (isEmb) {
                pickTembS();
            } else if (isJuxt) {
                pickTjuxtS();
            }

        } else if (isMatrix) {
            hideDictEmb();
            hideHypergraphEmb();
            pickMatrixEmb();

            if (isEmb) {
                pickTembS();
            } else if (isJuxt) {
                pickTjuxtS();
            }
        }
    }

    // ST-R
    if (isST_left && isR_right) {
        pickROptions();
        if (isEmb) {
            if (isHypergraph) {
                hideSTEmbDict();
                hideSTEmbMatrix();
                // if (isJuxt) pickHypergraphJuxt();
                if (isEmb) pickSTEmbHypergraph();
                showVisualisation();
            } else if (isDict) {
                hideSTEmbMatrix();
                hideSTEmbHypergraph();
                // if (isJuxt) pickDictJuxt();
                if (isEmb) pickSTEmbDict();
                showVisualisation();
            } else if (isMatrix) {
                hideSTEmbDict();
                hideSTEmbHypergraph();
                // if (isJuxt) pickMatrixJuxt();
                if (isEmb) pickSTEmbMatrix();
                showVisualisation();
            } else {
                hideVisualisation();
            }
        } else if (isJuxt) {
            hideSTEmbDict();
            hideSTEmbMatrix();
            hideSTEmbHypergraph();

            hideSOptions();
            pickSTOptions();

            hideTembS();
            hideTjuxtS();
            if (isHypergraph) {
                hideDictJuxt();
                hideMatrixJuxt();

                pickHypergraphJuxt();
            } else if (isDict) {
                hideMatrixJuxt();
                hideHypergraphJuxt();

                pickDictJuxt();
            } else if (isMatrix) {
                hideDictJuxt();
                hideHypergraphJuxt();
                pickMatrixJuxt();
            }
            if (isTembS && (isHypergraph || isDict || isMatrix)) {
                pickTembS();
                showVisualisation();
            } else if (isTjuxtS && (isHypergraph || isDict || isMatrix)) {
                pickTjuxtS();
                showVisualisation();
            } else if (isTencS && (isHypergraph || isDict || isMatrix)) {
                if (isHypergraph) {
                    pickHypergraphJuxtEnc();
                } else if (isDict) {
                    pickDictJuxtEnc();
                } else if (isMatrix) {
                    pickMatrixJuxtEnc();
                } else {
                    pickSpace();
                    hideTjuxtS();
                    hideTembS();
                }
                showVisualisation();
            } else {
                hideVisualisation();
            }
        }
    } else {
        hideSTEmbDict();
        hideSTEmbMatrix();
        hideSTEmbHypergraph();
        if (!isR_left && !isST_right) {
            hideDictJuxt();
            hideMatrixJuxt();
            hideHypergraphJuxt();
            if (!isT_left) {
                hideTembS();
                hideTjuxtS();
                hideAllEnc();
            }
        }
    }

    // SR-T
    if (isSR_left && isT_right) {
        hideSpace();
        hideSOptions();
        if (isEmb) {
            hideSRMatrixJuxtT();
            hideSRDictJuxtT();
            hideSRJuxtT();

            if (isHypergraph) {
                hideSRMatrixEmbT();
                hideSRDictEmbT();

                pickSREmbT();
                showVisualisation();
            } else if (isDict) {
                hideSRMatrixEmbT();
                hideSREmbT();

                pickSRDictEmbT();
                showVisualisation();
            } else if (isMatrix) {
                hideSRDictEmbT();
                hideSREmbT();

                pickSRMatrixEmbT();
                showVisualisation();
            }
        } else if (isJuxt) {
            hideSRMatrixEmbT();
            hideSRDictEmbT();
            hideSREmbT();

            if (isHypergraph) {
                hideSRMatrixJuxtT();
                hideSRDictJuxtT();

                pickSRJuxtT();
                showVisualisation();
            } else if (isDict) {
                hideSRMatrixJuxtT();
                hideSRJuxtT();

                pickSRDictJuxtT();
                showVisualisation();
            } else if (isMatrix) {
                hideSRDictJuxtT();
                hideSRJuxtT();

                pickSRMatrixJuxtT();
                showVisualisation();
            }
        }
    } else {
        hideSRMatrixJuxtT();
        hideSRDictJuxtT();
        hideSRJuxtT();

        hideSRMatrixEmbT();
        hideSRDictEmbT();
        hideSREmbT();
    }

    //S-RT
    if (isS_left && isRT_right) {
        pickRTOptions();
        if (isEmb) {
            if (isStorylines) {
                pickSEmbRT();
                hideSEmbTimeline();
                showVisualisation();
            } else if (isTimelines) {
                pickSEmbTimeline();
                hideSEmbRT();
                showVisualisation();
            }
        } else if (isJuxt) {
            hideSEmbRT();
            hideSEmbTimeline();
            if (isStorylines) {
                hideTimelinesJuxt();
                pickStorylinesJuxt();
                showVisualisation();
            }
            if (isTimelines) {
                hideStorylinesJuxt();
                pickTimelinesJuxt();
                showVisualisation();
            }
        }
    } else {
        hideSEmbTimeline();
        hideSEmbRT();
        if (!(isRT_left && isS_right)) {
            hideStorylinesJuxt();
            hideTimelinesJuxt();
        }
    }
}

function showVisualisation() {
    imageHolder.style.display = 'block';
}
function hideVisualisation() {
    imageHolder.style.display = 'none'
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// S-RT

function pickSEmbRT() {
    sEmbRT.style.display = 'block';
}
function hideSEmbRT() {
    sEmbRT.style.display = 'none';
}
function pickSEmbTimeline() {
    sEmbTimeline.style.display = 'block';
}
function hideSEmbTimeline() {
    sEmbTimeline.style.display = 'none';
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// SR-T

function pickSREmbT() {
    srEmbT.style.display = 'block';
}
function hideSREmbT() {
    srEmbT.style.display = 'none';
}
function pickSRDictEmbT() {
    srDictEmbT.style.display = 'block';
}
function hideSRDictEmbT() {
    srDictEmbT.style.display = 'none';
}
function pickSRMatrixEmbT() {
    srMatrixEmbT.style.display = 'block';
}
function hideSRMatrixEmbT() {
    srMatrixEmbT.style.display = 'none';
}
function pickSRJuxtT() {
    srJuxtT.style.display = 'block';
}
function hideSRJuxtT() {
    srJuxtT.style.display = 'none';
}
function pickSRDictJuxtT() {
    srDictJuxtT.style.display = 'block';
}
function hideSRDictJuxtT() {
    srDictJuxtT.style.display = 'none';
}
function pickSRMatrixJuxtT() {
    srMatrixJuxtT.style.display = 'block';
}
function hideSRMatrixJuxtT() {
    srMatrixJuxtT.style.display = 'none';
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////// ST-R

function pickSTEmbHypergraph() {
    stEmbGraph.style.display = 'block';
}
function hideSTEmbHypergraph() {
    stEmbGraph.style.display = 'none';
}
function pickSTEmbDict() {
    stEmbDict.style.display = 'block';
}
function hideSTEmbDict() {
    stEmbDict.style.display = 'none';
}
function pickSTEmbMatrix() {
    stEmbMatrix.style.display = 'block';
}
function hideSTEmbMatrix() {
    stEmbMatrix.style.display = 'none';
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
function pickSTOptions() {
    stOptions.style.display = 'block';
}
function hideSTOptions() {
    stOptions.style.display = 'none';
}
// ST display
//emb
function pickTembS() {
    // hide other T
    hideTjuxtS();
    hideAllEnc();

    pickSpace();
    tEmbS.style.display = 'block';
}
function hideTembS() {
    tEmbS.style.display = 'none';
    console.log('hide T emb S')
}
//juxt
function pickTjuxtS() {
    // hide other T
    hideTembS();
    hideAllEnc();

    pickSpace();
    tJuxtS.style.display = 'block';
}
function hideTjuxtS() {
    tJuxtS.style.display = 'none';
}
//enc juxt
function pickHypergraphJuxtEnc() {
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

    pickSpace();
    rJuxtGraphEnc.style.display = 'block';
}
function hideHypergraphJuxtEnc() {
    rJuxtGraphEnc.style.display = 'none';
}
function pickDictJuxtEnc() {
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

    pickSpace();
    rJuxtDictEnc.style.display = 'block';
}
function hideDictJuxtEnc() {
    rJuxtDictEnc.style.display = 'none';
}
function pickMatrixJuxtEnc() {
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

    pickSpace();
    rJuxtMatrixEnc.style.display = 'block';
}
function hideMatrixJuxtEnc() {
    rJuxtMatrixEnc.style.display = 'none';
}
// enc emb
function pickHypergraphEmbEnc() {
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

    pickSpace();
    rEmbGraphEnc.style.display = 'block';
}
function hideHypergraphEmbEnc() {
    rEmbGraphEnc.style.display = 'none';
}
function pickDictEmbEnc() {
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

    pickSpace();
    rEmbDictEnc.style.display = 'block';
}
function hideDictEmbEnc() {
    rEmbDictEnc.style.display = 'none';
}
function pickMatrixEmbEnc() {
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

    pickSpace();
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
function pickROptions() {
    rOptions.style.display = 'block';
    rtOptions.style.display = 'none';
}

function hideROptions() {
    rOptions.style.display = 'none';
}
// R display
//Hypergraph
function pickHypergraphJuxt() {
    pickSpace();
    rJuxtGraph.style.display = 'block';
    hideHypergraphEmb();
}
function hideHypergraphJuxt() {
    rJuxtGraph.style.display = 'none';
}
function pickHypergraphEmb() {
    pickSpace();
    rEmbGraph.style.display = 'block';
    hideHypergraphJuxt();
}
function hideHypergraphEmb() {
    rEmbGraph.style.display = 'none';
}
//Dict
function pickDictJuxt() {
    pickSpace();
    rJuxtDict.style.display = 'block';
    hideDictEmb();
}
function hideDictJuxt() {
    rJuxtDict.style.display = 'none';
}
function pickDictEmb() {
    pickSpace();
    rEmbDict.style.display = 'block';
    hideDictJuxt();
}
function hideDictEmb() {
    rEmbDict.style.display = 'none';
}
//Matrix
function pickMatrixJuxt() {
    pickSpace();
    rJuxtMatrix.style.display = 'block';
    hideMatrixEmb();
}
function hideMatrixJuxt() {
    rJuxtMatrix.style.display = 'none';
}
function pickMatrixEmb() {
    pickSpace();
    rEmbMatrix.style.display = 'block';
    hideMatrixJuxt();
}
function hideMatrixEmb() {
    rEmbMatrix.style.display = 'none';
}
//R emb TencS
function pickHypergraphEnc() {
    console.log('pickHypergraphEnc')
}
function hideHypergraphEnc() {
    console.log('hideHypergraphEnc')
}
function pickDictEnc() {
    console.log('pickDictEnc')
}
function hideDictEnc() {
    console.log('hideDictEnc')
}
function pickMatrixEnc() {
    console.log('pickMatrixEnc')
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
function pickRTOptions() {
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
function pickStorylinesJuxt() {
    pickSpace();
    rtJuxtStory.style.display = 'block';
    rtEmbStory.style.display = 'none';
}
function hideStorylinesJuxt() {
    rtJuxtStory.style.display = 'none';
}
function pickTimelinesJuxt() {
    pickSpace();
    rtJuxtTime.style.display = 'block';
    rtEmbTime.style.display = 'none';
}
function hideTimelinesJuxt() {
    rtJuxtTime.style.display = 'none';
}
//Storylines emb
function pickStorylinesEmb() {
    pickSpace();
    rtEmbStory.style.display = 'block';
    rtJuxtStory.style.display = 'none';
}
function hideStorylinesEmb() {
    rtEmbStory.style.display = 'none';
}
function pickTimelinesEmb() {
    pickSpace();
    rtEmbTime.style.display = 'block';
    rtJuxtTime.style.display = 'none';
}
function hideTimelinesEmb() {
    rtEmbTime.style.display = 'none';
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////// S
function pickSOptions() {
    sOptions.style.display = 'block';
}
function hideSOptions() {
    sOptions.style.display = 'none';
}
// S display
function pickSpace() {
    space.style.display = 'block';
    noSpace.style.display = 'none';
    isSpace = true;
}
function hideSpace() {
    space.style.display = 'none';
    noSpace.style.display = 'block';
    isSpace = false;
}