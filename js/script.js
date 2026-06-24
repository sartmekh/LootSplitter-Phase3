const STORAGE_KEY = 'lootSplitterState';

let lootItems = [];
let partySize = 1;

let nameInput = document.getElementById('lootName');
let valueInput = document.getElementById('lootValue');
let quantityInput = document.getElementById('lootQuantity');
let inputMessage = document.getElementById('lootMessage');
let partyMessage = document.getElementById('partyMessage');
let sizeInput = document.getElementById('sizeInput');
let noLootMessage = document.getElementById('noLootMessage');
let lootRows = document.getElementById('lootRows');
let listTotalRow = document.getElementById('listTotalRow');
let listTotalSpan = document.getElementById('listTotalValue');
let splitResults = document.getElementById('splitResults');
let splitTotalSpan = document.getElementById('splitTotalValue');
let perPersonSpan = document.getElementById('perPersonValue');
let lootBtn = document.getElementById('lootBtn');
let splitBtn = document.getElementById('splitBtn');
let resetBtn = document.getElementById('resetBtn');

function saveState() {
    let appState = {
        loot: lootItems,
        partySize: partySize
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function restoreState() {
    lootItems = [];
    partySize = 1;

    let savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState === null) {
        sizeInput.value = partySize;
        return;
    }

    try {
        let parsedState = JSON.parse(savedState);

        if (typeof parsedState !== 'object' || parsedState === null || !Array.isArray(parsedState.loot)) {
            sizeInput.value = partySize;
            return;
        }

        if (Number.isInteger(parsedState.partySize) && parsedState.partySize >= 1) {
            partySize = parsedState.partySize;
        }

        for (let i = 0; i < parsedState.loot.length; i++) {
            let restoredName = parsedState.loot[i].name;
            let restoredValue = Number(parsedState.loot[i].value);
            let restoredQuantity = Number(parsedState.loot[i].quantity);

            // entries are validated so damaged storage cannot enter state
            if (typeof restoredName === 'string' && restoredName.trim() !== '' && !isNaN(restoredValue) && restoredValue >= 0 && Number.isInteger(restoredQuantity) && restoredQuantity >= 1) {
                let restoredItem = {
                    name: restoredName.trim(),
                    value: restoredValue,
                    quantity: restoredQuantity
                };

                lootItems.push(restoredItem);
            }
        }
    } catch (error) {
        lootItems = [];
        partySize = 1;
    }

    sizeInput.value = partySize;
}

function addLoot() {
    let name = nameInput.value.trim();
    let value = Number(valueInput.value);
    let quantity = Number(quantityInput.value);

    // validation is before mutation so data data of invalid form doesn't save or display
    if (name === '' || valueInput.value.trim() === '' || isNaN(value) || value < 0 || !Number.isInteger(quantity) || quantity < 1) {
        inputMessage.innerText = 'Please enter a valid loot name, value, and quantity.';
        return;
    }

    let lootItem = {
        name: name,
        value: value,
        quantity: quantity
    };

    lootItems.push(lootItem);

    nameInput.value = '';
    valueInput.value = '';
    quantityInput.value = '1';
    inputMessage.innerText = `${name} added.`;

    saveState();
    updateUI();
}

function splitLoot() {
    updateUI();
}

function removeLoot(index) {
    let toRemoveIndex = parseInt(index);

    // index is validated before splice so remove only mutates real array items
    if (isNaN(toRemoveIndex) || toRemoveIndex < 0 || toRemoveIndex >= lootItems.length) {
        inputMessage.innerText = 'Please select loot to remove.';
        return;
    }

    let removedLoot = lootItems.splice(toRemoveIndex, 1)[0];
    inputMessage.innerText = `${removedLoot.name} removed.`;

    saveState();
    updateUI();
}

function changePartySize() {
    let nextPartySize = Number(sizeInput.value);

    if (!Number.isInteger(nextPartySize) || nextPartySize < 1) {
        updateUI();
        return;
    }

    partySize = nextPartySize;
    saveState();
    updateUI();
}

function resetAll() {
    lootItems = [];
    partySize = 1;
    sizeInput.value = partySize;
    inputMessage.innerText = 'All saved loot has been reset.';
    partyMessage.innerText = '';

    localStorage.removeItem(STORAGE_KEY);
    updateUI();
}

function updateUI() {
    // updateUI renders from state only and storage is used by saveState and restoreState.
    let currentPartyInput = Number(sizeInput.value);
    let partyIsValid = Number.isInteger(currentPartyInput) && currentPartyInput >= 1;
    let hasLoot = lootItems.length > 0;
    let totalValue = 0;

    lootRows.innerHTML = '';

    if (hasLoot) {
        noLootMessage.classList.add('hidden');

        // loot array is the used for both rendering and total calculation.
        for (let i = 0; i < lootItems.length; i++) {
            totalValue += lootItems[i].value * lootItems[i].quantity;

            let row = document.createElement('div');
            row.className = 'loot-row';

            let nameCell = document.createElement('div');
            nameCell.className = 'loot-cell';
            nameCell.innerText = lootItems[i].name;

            let valueCell = document.createElement('div');
            valueCell.className = 'loot-cell';
            valueCell.innerText = lootItems[i].value.toFixed(2);

            let quantityCell = document.createElement('div');
            quantityCell.className = 'loot-cell';
            quantityCell.innerText = lootItems[i].quantity;

            let actionCell = document.createElement('div');
            actionCell.className = 'loot-cell loot-actions';

            let removeBtn = document.createElement('button');
            removeBtn.className = 'loot-remove';
            removeBtn.innerText = 'Remove';
            removeBtn.addEventListener('click', function () {
                removeLoot(i);
            });

            actionCell.appendChild(removeBtn);

            row.appendChild(nameCell);
            row.appendChild(valueCell);
            row.appendChild(quantityCell);
            row.appendChild(actionCell);
            lootRows.appendChild(row);
        }
    } else {
        noLootMessage.classList.remove('hidden');
    }

    if (partyIsValid) {
        partyMessage.innerText = '';
    } else {
        partyMessage.innerText = 'Please enter a valid party size.';
    }

    listTotalSpan.innerText = `$${totalValue.toFixed(2)}`;
    splitTotalSpan.innerText = `$${totalValue.toFixed(2)}`;

    if (hasLoot) {
        listTotalRow.classList.remove('hidden');
    } else {
        listTotalRow.classList.add('hidden');
    }

    // results are shown when state is ready for a valid split
    if (hasLoot && partyIsValid) {
        let share = totalValue / partySize;
        perPersonSpan.innerText = `$${share.toFixed(2)}`;
        splitResults.classList.remove('hidden');
        splitBtn.disabled = false;
    } else {
        perPersonSpan.innerText = '$0.00';
        splitResults.classList.add('hidden');
        splitBtn.disabled = true;
    }
}

lootBtn.addEventListener('click', function () {
    addLoot();
});

splitBtn.addEventListener('click', function () {
    splitLoot();
});

resetBtn.addEventListener('click', function () {
    resetAll();
});

sizeInput.addEventListener('input', function () {
    changePartySize();
});

restoreState();
updateUI();
