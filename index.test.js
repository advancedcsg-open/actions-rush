const process = require('process')
const cp = require('child_process')
const path = require('path')

// shows how main runner will run a javascript action with env / stdout protocol
test('test main runs', () => {
  const ip = path.join(__dirname, 'main.js');
  console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString());
})

// shows how main runner will run a javascript action with env / stdout protocol
test('test cleanup runs', () => {
  const ip = path.join(__dirname, 'cleanup.js');
  console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString());
})
