const NetworkTables = require('../network-tables');

const state = {
  val: 0,
  offset: 0,
  get visualVal() {
     let visualVal = Math.floor(this.val - this.offset) % 360;
     if (visualVal < 0) {
        visualVal += 360;
     }
     return visualVal;
  }
};

const elements = {
  container: document.getElementById('gyro'),
  arm: document.getElementById('gyro-arm'),
  number: document.getElementById('gyro-number')
};

elements.container.onclick = reset;

function update(value) {
    state.val = value;
    elements.arm.style.transform = `rotate(${state.visualVal}deg)`;
    elements.number.textContent = state.visualVal + 'º';
}

function reset() {
  state.offset = state.val;
  update(state.val);
}

module.exports = {
  update: update,
  reset: reset
};

NetworkTables.addKeyListener('/SmartDashboard/drive/navx/yaw', (key, val) => update(val));