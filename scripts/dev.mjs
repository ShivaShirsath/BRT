import { networkInterfaces } from 'os';
import { spawn } from 'child_process';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const familyV4 = typeof net.family === 'string' ? net.family === 'IPv4' : net.family === 4;
      if (familyV4 && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const apiBase = `http://${localIp}:8080/api/v1`;

console.log(`\x1b[36m[Auto-IP] Local IP detected: ${localIp}\x1b[0m`);
console.log(`\x1b[36m[Auto-IP] Setting VITE_API_BASE to: ${apiBase}\x1b[0m`);

// Spawn Vite dev server and inherit stdio
const viteProcess = spawn('npx', ['vite', '--host'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_API_BASE: apiBase
  }
});

viteProcess.on('close', (code) => {
  process.exit(code);
});
