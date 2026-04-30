const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let mainWindow;
let backendProcess;
let frontendProcess;

function startBackend() {
  console.log('Starting Backend (Production)...');
  backendProcess = spawn('node', ['dist/src/main.js'], {
    cwd: path.join(__dirname, 'backend'),
    windowsHide: true,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));
}

function startFrontend() {
  console.log('Starting Frontend (Production)...');
  frontendProcess = spawn('cmd.exe', ['/c', 'npm run preview -- --port 5173 --strictPort'], {
    cwd: path.join(__dirname, 'frontend'),
    shell: true,
    windowsHide: true
  });

  frontendProcess.stdout.on('data', (data) => console.log(`Frontend: ${data}`));
  frontendProcess.stderr.on('data', (data) => console.error(`Frontend Error: ${data}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Billing POS Desktop",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Give servers time to start (Production starts faster)
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5173/dashboard');
  }, 5000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startBackend();
  startFrontend();
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('Closing all processes...');
  if (backendProcess) kill(backendProcess.pid);
  if (frontendProcess) kill(frontendProcess.pid);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  if (backendProcess) kill(backendProcess.pid);
  if (frontendProcess) kill(frontendProcess.pid);
});
