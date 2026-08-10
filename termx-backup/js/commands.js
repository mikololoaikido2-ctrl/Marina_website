/* ==========================================================================
   TERMX - COMMAND REGISTRY & INTERPRETER ENGINE
   Processes user inputs, formatting, colorful terminal responses & interactive widgets
   ========================================================================== */

class CommandEngine {
  constructor() {
    this.commands = {
      'help': this.cmdHelp,
      'man': this.cmdHelp,
      'ls': this.cmdLs,
      'cd': this.cmdCd,
      'pwd': this.cmdPwd,
      'mkdir': this.cmdMkdir,
      'touch': this.cmdTouch,
      'cat': this.cmdCat,
      'rm': this.cmdRm,
      'echo': this.cmdEcho,
      'clear': this.cmdClear,
      'history': this.cmdHistory,
      'neofetch': this.cmdNeofetch,
      'fastfetch': this.cmdNeofetch,
      'htop': this.cmdHtop,
      'top': this.cmdHtop,
      'theme': this.cmdTheme,
      'sound': this.cmdSound,
      'audio': this.cmdSound,
      'split': this.cmdSplit,
      'js': this.cmdJs,
      'node': this.cmdJs,
      'curl': this.cmdCurl,
      'wget': this.cmdCurl,
      'matrix': this.cmdMatrix,
      'snake': this.cmdSnake,
      'date': this.cmdDate,
      'whoami': this.cmdWhoami,
      'uptime': this.cmdUptime,
      'fortune': this.cmdFortune,
      'cowsay': this.cmdCowsay,
      'sudo': this.cmdSudo,
      'tree': this.cmdTree
    };
  }

  execute(cmdLine, context) {
    const trimmed = cmdLine.trim();
    if (!trimmed) return { output: '', async: false };

    // Add to session history
    context.history.push(trimmed);

    const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [trimmed];
    const rawCmd = parts[0].toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    if (this.commands[rawCmd]) {
      return this.commands[rawCmd].call(this, args, context);
    } else {
      return {
        output: `<span class="output-line error">zsh: command not found: ${this.escapeHtml(rawCmd)}. Type <span class="info">help</span> to list commands.</span>`,
        async: false
      };
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------------------
     Command Implementations
     ------------------------------------------------------------------------ */

  cmdHelp(args, context) {
    return {
      output: `
<div class="output-line info"><strong>TermX v4.0 CLI Command Directory</strong></div>
<div class="output-line system">--------------------------------------------------</div>
<div class="output-line"><strong>FILE SYSTEM:</strong></div>
<div class="output-line">  <span class="info">ls [-la]</span>         List directory files and folders</div>
<div class="output-line">  <span class="info">cd &lt;dir&gt;</span>         Change working directory</div>
<div class="output-line">  <span class="info">pwd</span>              Print current working directory</div>
<div class="output-line">  <span class="info">cat &lt;file&gt;</span>       Display file content</div>
<div class="output-line">  <span class="info">mkdir &lt;dir&gt;</span>      Create a new directory</div>
<div class="output-line">  <span class="info">touch &lt;file&gt;</span>     Create an empty file</div>
<div class="output-line">  <span class="info">rm &lt;path&gt;</span>        Remove file or empty directory</div>
<div class="output-line">  <span class="info">tree</span>             Print hierarchical directory tree</div>
<br>
<div class="output-line"><strong>SYSTEM & VISUALS:</strong></div>
<div class="output-line">  <span class="info">neofetch</span>         Display system information and ASCII logo</div>
<div class="output-line">  <span class="info">htop</span>             Interactive process monitor widget</div>
<div class="output-line">  <span class="info">theme &lt;name&gt;</span>     Set theme (cyberpunk, matrix, crt-amber, dracula, nord, tokyo)</div>
<div class="output-line">  <span class="info">sound</span>            Toggle mechanical keyboard click sound effects</div>
<div class="output-line">  <span class="info">split</span>            Toggle dual split-pane terminal workspace</div>
<div class="output-line">  <span class="info">clear</span>            Clear terminal buffer (<kbd>Ctrl+L</kbd>)</div>
<br>
<div class="output-line"><strong>INTERACTIVE INTERPRETER & APIS:</strong></div>
<div class="output-line">  <span class="info">js [code]</span>        Execute JS snippet in live REPL context</div>
<div class="output-line">  <span class="info">curl &lt;endpoint&gt;</span>  Simulate HTTP GET (e.g. curl api/crypto, curl api/quote)</div>
<div class="output-line">  <span class="info">matrix</span>           Launch Matrix green digital rain animation</div>
<div class="output-line">  <span class="info">snake</span>            Play mini CLI Snake arcade game</div>
<div class="output-line">  <span class="info">fortune / cowsay</span> Fun utilities and quotes</div>
`,
      async: false
    };
  }

  cmdLs(args, context) {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
    
    // Find target path arg if any
    const pathArg = args.find(a => !a.startsWith('-')) || '';
    const res = window.vfs.listDir(context.cwdParts.join('/'), pathArg);

    if (!res.success) {
      return { output: `<span class="output-line error">${res.error}</span>`, async: false };
    }

    let items = res.items;
    if (!showAll) {
      items = items.filter(i => !i.name.startsWith('.'));
    }

    if (showLong) {
      let lines = [`<div class="output-line system">total ${items.length}</div>`];
      items.forEach(item => {
        const perm = item.type === 'dir' ? 'drwxr-xr-x' : (item.executable ? '-rwxr-xr-x' : '-rw-r--r--');
        const colorClass = item.type === 'dir' ? 'prompt-path' : (item.executable ? 'prompt-user' : 'text-main');
        const sizeStr = item.size.toString().padStart(6, ' ');
        lines.push(`<div class="output-line">${perm}  user  user  ${sizeStr} Aug 09 18:25 <span class="${colorClass}">${item.name}${item.type === 'dir' ? '/' : ''}</span></div>`);
      });
      return { output: lines.join(''), async: false };
    } else {
      const formatted = items.map(item => {
        const colorClass = item.type === 'dir' ? 'prompt-path' : (item.executable ? 'prompt-user' : 'text-main');
        return `<span class="${colorClass}" style="margin-right: 16px; font-weight: 600;">${item.name}${item.type === 'dir' ? '/' : ''}</span>`;
      }).join('');
      return { output: `<div class="output-line">${formatted}</div>`, async: false };
    }
  }

  cmdCd(args, context) {
    const target = args[0] || '~';
    const targetParts = window.vfs.resolvePathParts(context.cwdParts.join('/'), target);
    const node = window.vfs.getNode(targetParts);

    if (!node) {
      return { output: `<span class="output-line error">cd: no such file or directory: ${this.escapeHtml(target)}</span>`, async: false };
    }
    if (node.type !== 'dir') {
      return { output: `<span class="output-line error">cd: not a directory: ${this.escapeHtml(target)}</span>`, async: false };
    }

    context.cwdParts = targetParts;
    return { output: '', async: false };
  }

  cmdPwd(args, context) {
    return { output: `<div class="output-line">${window.vfs.getAbsoluteStr(context.cwdParts)}</div>`, async: false };
  }

  cmdCat(args, context) {
    if (!args[0]) {
      return { output: `<span class="output-line error">cat: missing file operand</span>`, async: false };
    }
    const res = window.vfs.readFile(context.cwdParts.join('/'), args[0]);
    if (!res.success) {
      return { output: `<span class="output-line error">${res.error}</span>`, async: false };
    }
    return { output: `<div class="output-line">${this.escapeHtml(res.content)}</div>`, async: false };
  }

  cmdMkdir(args, context) {
    if (!args[0]) {
      return { output: `<span class="output-line error">mkdir: missing operand</span>`, async: false };
    }
    const res = window.vfs.makeDir(context.cwdParts.join('/'), args[0]);
    if (!res.success) {
      return { output: `<span class="output-line error">${res.error}</span>`, async: false };
    }
    return { output: `<div class="output-line success">Directory '${args[0]}' created.</div>`, async: false };
  }

  cmdTouch(args, context) {
    if (!args[0]) {
      return { output: `<span class="output-line error">touch: missing file operand</span>`, async: false };
    }
    const res = window.vfs.createFile(context.cwdParts.join('/'), args[0], '');
    if (!res.success) {
      return { output: `<span class="output-line error">${res.error}</span>`, async: false };
    }
    return { output: '', async: false };
  }

  cmdRm(args, context) {
    if (!args[0]) {
      return { output: `<span class="output-line error">rm: missing operand</span>`, async: false };
    }
    const res = window.vfs.removeNode(context.cwdParts.join('/'), args[0]);
    if (!res.success) {
      return { output: `<span class="output-line error">${res.error}</span>`, async: false };
    }
    return { output: `<div class="output-line success">Removed '${args[0]}'.</div>`, async: false };
  }

  cmdTree(args, context) {
    const res = window.vfs.listDir(context.cwdParts.join('/'), '.');
    if (!res.success) return { output: `<span class="output-line error">${res.error}</span>`, async: false };

    let output = `<div class="output-line prompt-path">.</div>`;
    res.items.forEach((item, idx) => {
      const isLast = idx === res.items.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const colorClass = item.type === 'dir' ? 'prompt-path' : 'text-main';
      output += `<div class="output-line">${prefix}<span class="${colorClass}">${item.name}</span></div>`;
    });
    return { output, async: false };
  }

  cmdEcho(args) {
    return { output: `<div class="output-line">${this.escapeHtml(args.join(' '))}</div>`, async: false };
  }

  cmdClear() {
    return { output: '__CLEAR__', async: false };
  }

  cmdHistory(args, context) {
    const lines = context.history.map((cmd, i) => `<div class="output-line">  ${(i + 1).toString().padStart(4, ' ')}  ${this.escapeHtml(cmd)}</div>`);
    return { output: lines.join(''), async: false };
  }

  cmdNeofetch() {
    const ascii = `
      /\\
     /  \\
    / /\\ \\
   / /  \\ \\
  / /    \\ \\
 /_/__/\\__\\_\\
`;
    const html = `
<div class="neofetch-container">
  <pre class="neofetch-ascii">${ascii}</pre>
  <div class="neofetch-info">
    <div class="neofetch-title">user@termx-hypervisor</div>
    <div class="output-line system">-----------------------</div>
    <div class="neofetch-line"><span class="neofetch-label">OS:</span> TermX CyberOS v4.0 x86_64</div>
    <div class="neofetch-line"><span class="neofetch-label">Kernel:</span> 6.8.0-42-generic</div>
    <div class="neofetch-line"><span class="neofetch-label">Uptime:</span> 4 hours, 12 mins</div>
    <div class="neofetch-line"><span class="neofetch-label">Shell:</span> zsh 5.9 (x86_64-apple-darwin22)</div>
    <div class="neofetch-line"><span class="neofetch-label">Resolution:</span> 1920x1080 @ 120Hz (Retina Display)</div>
    <div class="neofetch-line"><span class="neofetch-label">Terminal:</span> TermX Glassmorphic Canvas TTY</div>
    <div class="neofetch-line"><span class="neofetch-label">CPU:</span> Quantum 8-Core Neural Engine @ 4.20GHz</div>
    <div class="neofetch-line"><span class="neofetch-label">GPU:</span> CyberGlow RayTracing Ultra</div>
    <div class="neofetch-line"><span class="neofetch-label">Memory:</span> 7864MiB / 16384MiB</div>
  </div>
</div>
`;
    return { output: html, async: false };
  }

  cmdHtop() {
    const html = `
<div class="htop-container">
  <div class="output-line info"><strong>TermX htop - Process Manager (Live)</strong></div>
  <div class="htop-header-bars">
    <div>CPU [||||||||||||.......... 42.0%]</div>
    <div>MEM [||||||||||||||||...... 48.2%]</div>
  </div>
  <table class="htop-table">
    <thead>
      <tr><th>PID</th><th>USER</th><th>RES</th><th>CPU%</th><th>MEM%</th><th>TIME+</th><th>COMMAND</th></tr>
    </thead>
    <tbody>
      <tr><td>1042</td><td>user</td><td>240M</td><td>14.2</td><td>2.1</td><td>01:14</td><td>node server.js</td></tr>
      <tr><td>1892</td><td>user</td><td>820M</td><td>22.5</td><td>5.1</td><td>04:02</td><td>termx-render-engine</td></tr>
      <tr><td>2104</td><td>root</td><td>12M</td><td>0.1</td><td>0.1</td><td>00:02</td><td>systemd-journald</td></tr>
      <tr><td>3412</td><td>user</td><td>45M</td><td>5.2</td><td>0.4</td><td>00:18</td><td>zsh (tty1)</td></tr>
    </tbody>
  </table>
</div>
`;
    return { output: html, async: false };
  }

  cmdTheme(args) {
    const themeName = args[0] ? args[0].toLowerCase() : '';
    const validThemes = {
      'cyberpunk': 'theme-cyberpunk',
      'matrix': 'theme-matrix',
      'crt-amber': 'theme-crt-amber',
      'amber': 'theme-crt-amber',
      'dracula': 'theme-dracula',
      'nord': 'theme-nord',
      'tokyo': 'theme-tokyo'
    };

    if (validThemes[themeName]) {
      const cls = validThemes[themeName];
      document.body.className = document.body.className.replace(/theme-[a-z-]+/g, '') + ' ' + cls;
      const select = document.getElementById('themeSelect');
      if (select) select.value = cls;
      return { output: `<div class="output-line success">Switched theme to [${themeName}].</div>`, async: false };
    } else {
      return { output: `<span class="output-line error">Usage: theme &lt;cyberpunk|matrix|amber|dracula|nord|tokyo&gt;</span>`, async: false };
    }
  }

  cmdSound() {
    const enabled = window.termAudio.toggleSound();
    const btn = document.getElementById('btnToggleSound');
    if (btn) btn.classList.toggle('active', enabled);
    return { output: `<div class="output-line info">Keyboard audio sound clicks: ${enabled ? 'ENABLED 🔊' : 'DISABLED 🔇'}</div>`, async: false };
  }

  cmdSplit() {
    const pane2 = document.getElementById('pane2');
    if (pane2) {
      pane2.classList.toggle('hidden');
      return { output: `<div class="output-line info">Dual split-pane workspace toggled.</div>`, async: false };
    }
    return { output: '', async: false };
  }

  cmdJs(args) {
    const code = args.join(' ');
    if (!code) {
      return { output: `<div class="output-line info">Type 'js &lt;code&gt;' to evaluate JavaScript expressions. Example: <span class="prompt-user">js 2 + 2 * 10</span></div>`, async: false };
    }
    try {
      const result = eval(code);
      return { output: `<div class="output-line success">=> ${this.escapeHtml(String(result))}</div>`, async: false };
    } catch (e) {
      return { output: `<span class="output-line error">Uncaught JS Error: ${this.escapeHtml(e.message)}</span>`, async: false };
    }
  }

  cmdCurl(args) {
    const endpoint = args[0] || 'api/quote';

    if (endpoint.includes('crypto')) {
      const mockCrypto = {
        "timestamp": new Date().toISOString(),
        "assets": [
          { "symbol": "BTC/USD", "price": 94250.00, "change_24h": "+3.4%" },
          { "symbol": "ETH/USD", "price": 3840.50, "change_24h": "+5.1%" },
          { "symbol": "SOL/USD", "price": 194.20, "change_24h": "+8.9%" }
        ]
      };
      return { output: `<div class="output-line"><pre>${JSON.stringify(mockCrypto, null, 2)}</pre></div>`, async: false };
    } else {
      const mockQuote = {
        "status": 200,
        "quote": "Talk is cheap. Show me the code.",
        "author": "Linus Torvalds"
      };
      return { output: `<div class="output-line"><pre>${JSON.stringify(mockQuote, null, 2)}</pre></div>`, async: false };
    }
  }

  cmdMatrix() {
    if (window.matrixEngine) {
      window.matrixEngine.startModalMode();
      return { output: `<div class="output-line success">Matrix rain animation launched. Press ESC to exit canvas overlay.</div>`, async: false };
    }
    return { output: '', async: false };
  }

  cmdSnake() {
    if (window.snakeGame) {
      window.snakeGame.start();
      return { output: `<div class="output-line success">Snake game started in Arcade modal. Use Arrow Keys to play, ESC to exit.</div>`, async: false };
    }
    return { output: '', async: false };
  }

  cmdDate() {
    return { output: `<div class="output-line">${new Date().toUTCString()}</div>`, async: false };
  }

  cmdWhoami() {
    return { output: `<div class="output-line prompt-user">user (uid=1000 gid=1000 groups=1000(user),27(sudo))</div>`, async: false };
  }

  cmdUptime() {
    return { output: `<div class="output-line"> 18:25:00 up 4:12,  2 users,  load average: 0.24, 0.18, 0.15</div>`, async: false };
  }

  cmdFortune() {
    const fortunes = [
      "There are 10 types of people in the world: those who understand binary, and those who don't.",
      "A code refactor a day keeps the technical debt away.",
      "Simplicity is prerequisite for reliability. - Edsger W. Dijkstra",
      "First, solve the problem. Then, write the code. - John Johnson"
    ];
    const item = fortunes[Math.floor(Math.random() * fortunes.length)];
    return { output: `<div class="output-line info">🥠 ${item}</div>`, async: false };
  }

  cmdCowsay(args) {
    const text = args.join(' ') || "Moo! Welcome to TermX Simulator!";
    const border = '-'.repeat(text.length + 2);
    const cow = `
 ${border}
< ${text} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;
    return { output: `<div class="output-line"><pre>${this.escapeHtml(cow)}</pre></div>`, async: false };
  }

  cmdSudo() {
    return { output: `<span class="output-line error">[sudo] password for user: <br>Permission denied: This incident will be reported to Santa.</span>`, async: false };
  }
}

window.commandEngine = new CommandEngine();
