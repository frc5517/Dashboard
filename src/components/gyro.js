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

function update(value) {
    state.val = value;
    elements.arm.style.transform = `rotate(${state.visualVal}deg)`;
    elements.number.textContent = state.visualVal + 'º';
}

function reset() {
  state.offset = state.val;
  update(state.val);
}

elements.container.onclick = reset;

module.exports = {
  update: update,
  reset: reset
};
