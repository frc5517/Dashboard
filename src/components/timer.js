const NetworkTables = require('../network-tables');

const elements = {
    timer: document.getElementById('timer'),
};

function updateTime(value) {
    // We assume here that value is an integer representing the number of seconds left.
    let text = '0:00';
    if(value > 0) {
        text = Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
    }
    elements.timer.textContent = text;
}

NetworkTables.addKeyListener('/robot/time', (key, val) => updateTime(val));