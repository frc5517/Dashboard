const NetworkTables = require('../network-tables');
const NT_AUTO_KEY = '/SmartDashboard/Auto mode';

const state = {
    modes: [],
    selected: null,
};

const elements = {
    autoSelect: document.getElementById('auto-select'),
};

updateElements();

// Update the elements on the page to match the current state
function updateElements() {
    // Clear previous list
    while (elements.autoSelect.firstChild) {
        elements.autoSelect.removeChild(elements.autoSelect.firstChild);
    }
    if(state.modes.length === 0) {
        state.modes.push('No auto modes found');
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let mode of state.modes) {
        const option = document.createElement('option');
        option.textContent = mode;
        elements.autoSelect.appendChild(option);
    }
    // Set value to the selected mode.
    if(state.selected) elements.autoSelect.value = state.selected;
    else delete elements.autoSelect.value;
}

// Load list of autonomous modes from robot
NetworkTables.addKeyListener(`${NT_AUTO_KEY}/options`, (key, value) => {
    state.modes = value;
    state.selected = NetworkTables.getValue(`${NT_AUTO_KEY}/selected`);
    updateElements();
});

// Set the selected auto mode
NetworkTables.addKeyListener(`${NT_AUTO_KEY}/selected`, (key, value) => {
    state.selected = value;
    updateElements();
});

elements.autoSelect.onchange = function() {
    state.selected = this.value;
    NetworkTables.putValue(`${NT_AUTO_KEY}/selected`, this.value);
};