const ipc = require('electron').ipcRenderer;
const NetworkTables = require('./network-tables');
const config = require('./config');

const connection = require('./connection.js');
const gyro = require('./components/gyro');
const camera = require('./components/camera.js');
const timer = require('./components/timer');

const elements = {
    robotState: document.getElementById('robot-state'),
    robotDiagram: {
        arm: document.getElementById('robot-arm')
    },
    example: {
        button: document.getElementById('example-button'),
        readout: document.getElementById('example-readout').firstChild
    },
    autoSelect: document.getElementById('auto-select'),
    armPosition: document.getElementById('arm-position')
};

connection.addOnConnectionChangeListener(function(connected) {
    camera.toggle(connected);
    elements.robotState.textContent = connected ? 'Connected' : 'Disconnected';
});

NetworkTables.addGlobalListener(function(key, val) {
    console.log(key, val);
}, true);

// Key Listeners

// The following case is an example, for a robot with an arm at the front.
NetworkTables.addKeyListener('/SmartDashboard/arm/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 1140) {
        value = 1140;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
     const armAngle = value * 3 / 20 - 45;
    // Rotate the arm in diagram to match real arm
    elements.robotDiagram.arm.style.transform = `rotate(${armAngle}deg)`;
});

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/example_variable', (key, value) => {
    // Set class active if value is true and unset it if it is false
    elements.example.button.classList.toggle('active', value);
    elements.example.readout.data = 'Value is ' + value;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/Auto mode/options', (key, value) => {
    console.log('auto modes', key, value);
    // Clear previous list
    while (elements.autoSelect.firstChild) {
        elements.autoSelect.removeChild(elements.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        elements.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    elements.autoSelect.value = NetworkTables.getValue('/SmartDashboard/currentlySelectedMode');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    elements.autoSelect.value = value;
});

// The rest of the doc is listeners for UI elements being clicked on
elements.example.button.onclick = function() {
    // Set NetworkTables values to the opposite of whether button has active class.
    NetworkTables.putValue('/SmartDashboard/example_variable', this.className != 'active');
};

elements.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};
// Get value of arm height slider when it's adjusted
elements.armPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/arm/encoder', parseInt(this.value));
};

addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
});
