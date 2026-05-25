const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 80;

// Helper to execute terminal commands
function runCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, { encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error) resolve('');
            else resolve(stdout);
        });
    });
}

// Function to detect actual SSID and local IP on Windows
async function getRealNetworkInfo() {
    let ssid = 'Disconnected';
    let ip = '127.0.0.1';

    try {
        // 1. Get SSID (on Windows)
        const wlanOutput = await runCommand('netsh wlan show interfaces');
        const ssidMatch = wlanOutput.match(/^\s*SSID\s*:\s*(.+)$/m);
        if (ssidMatch && ssidMatch[1]) {
            ssid = ssidMatch[1].trim();
        }

        // 2. Get local IPv4
        const ipconfigOutput = await runCommand('ipconfig');

        // Let's parse ipconfig output
        const lines = ipconfigOutput.split('\n');
        let isWirelessAdapter = false;
        for (let line of lines) {
            if (line.includes('Wireless LAN adapter Wi-Fi:') || line.includes('Wireless LAN adapter Wi-Fi 2:')) {
                isWirelessAdapter = true;
            }
            if (isWirelessAdapter && line.includes('IPv4 Address')) {
                const ipMatch = line.match(/:\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
                if (ipMatch && ipMatch[1]) {
                    ip = ipMatch[1].trim();
                    break;
                }
            }
            // If we reach another main adapter header, stop
            if (isWirelessAdapter && line.trim() && !line.startsWith(' ') && !line.includes('Wi-Fi')) {
                isWirelessAdapter = false;
            }
        }

        // Fallback: if we didn't find active wireless IP, grep any valid IPv4 address that isn't loopback
        if (ip === '127.0.0.1') {
            const matches = ipconfigOutput.matchAll(/IPv4 Address[ .]*:\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g);
            for (const match of matches) {
                if (match[1] && match[1] !== '127.0.0.1') {
                    ip = match[1].trim();
                    break;
                }
            }
        }
    } catch (e) {
        console.error('Error gathering network info:', e);
    }

    return { ssid, ip };
}

const server = http.createServer(async (req, res) => {
    // API endpoint for real network info
    if (req.url === '/api/network') {
        const netInfo = await getRealNetworkInfo();
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        });
        res.end(JSON.stringify(netInfo));
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Remove query params
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // If path is folder or doesn't have extension, check index.html
    let resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
        resolvedPath = path.resolve('./index.html');
    }

    fs.readFile(resolvedPath, (error, content) => {
        if (error) {
            res.writeHead(500);
            res.end('Server Error: ' + error.code);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', async () => {
    const netInfo = await getRealNetworkInfo();
    const localIP = netInfo.ip !== '127.0.0.1' ? netInfo.ip : '127.0.0.1';

    console.log(`==================================================`);
    console.log(`🚀 TEJASKP AI Portal Server is running!`);
    console.log(`👉 Access on this PC: http://127.0.0.1:${PORT}`);
    if (localIP !== '127.0.0.1') {
        console.log(`📱 Access on Phone/Other PC: http://${localIP}:${PORT}`);
    }
    console.log(`🛡️ Real-time Network Monitoring active.`);
    console.log(`==================================================`);

    // Auto-open browser
    const url = `http://127.0.0.1:${PORT}`;
    const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCmd} ${url}`);
});
