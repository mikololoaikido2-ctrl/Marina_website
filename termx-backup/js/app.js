/* ==========================================================================
   TERMX - MAIN APPLICATION ORCHESTRATOR
   Handles UI events, multi-pane input routing, tab autocompletion, & sidebar
   ========================================================================== */

class TermXApp {
  constructor() {
    this.panes = {
      1: {
        id: 1,
        cwdParts: ['home', 'user'],
        history: [],
        historyIdx: -1,
        inputEl: document.getElementById('input1'),
        outputEl: document.getElementById('output1'),
        ghostEl: document.getElementById('ghost1'),
        pathEl: document.getElementById('promptPath1')
      },
      2: {
        id: 2,
        cwdParts: ['home', 'user'],
        history: [],
        historyIdx: -1,
        inputEl: document.getElementById('input2'),
        outputEl: document.getElementById('output2'),
        ghostEl: document.getElementById('ghost2'),
        pathEl: document.getElementById('promptPath2')
      }
    };
    this.activePaneId = 1;
    this.commandCount = 0;
  }

  init() {
    this.bindHeaderControls();
    this.bindSidebarControls();
    this.bindPaneInputs(1);
    this.bindPaneInputs(2);
    this.bindGlobalKeyboardShortcuts();
    this.startSystemClock();
    this.renderFileTree();

    // Print welcome banner in TTY 1
    this.printWelcomeBanner(1);
  }

  printWelcomeBanner(paneId) {
    const welcomeHtml = `
<div class="output-line info" style="font-weight: 700;">⚡ TermX Next-Gen Web Terminal Simulator v4.0.0</div>
<div class="output-line system">==========================================================================</div>
<div class="output-line">Welcome back, <span class="prompt-user">user</span>! Session initialized with 64-bit neural kernel.</div>
<div class="output-line">Type <span class="info">help</span> to view available CLI commands, or explore the virtual filesystem.</div>
<div class="output-line">Try running: <span class="prompt-path">neofetch</span> | <span class="prompt-path">htop</span> | <span class="prompt-path">matrix</span> | <span class="prompt-path">snake</span> | <span class="prompt-path">theme matrix</span></div>
<div class="output-line system">==========================================================================</div>
`;
    this.appendOutput(paneId, welcomeHtml);
  }

  bindHeaderControls() {
    // Theme Dropdown
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        window.commandEngine.cmdTheme([e.target.value.replace('theme-', '')]);
      });
    }

    // Toggle Sound Button
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        window.commandEngine.cmdSound();
      });
    }

    // Toggle CRT Scanlines
    const btnCRT = document.getElementById('btnToggleCRT');
    if (btnCRT) {
      btnCRT.addEventListener('click', () => {
        document.body.classList.toggle('crt-enabled');
        btnCRT.classList.toggle('active', document.body.classList.contains('crt-enabled'));
      });
    }

    // Toggle Split Pane
    const btnSplit = document.getElementById('btnToggleSplit');
    if (btnSplit) {
      btnSplit.addEventListener('click', () => {
        window.commandEngine.cmdSplit();
        btnSplit.classList.toggle('active', !document.getElementById('pane2').classList.contains('hidden'));
      });
    }

    // Toggle Sidebar Drawer
    const btnSidebar = document.getElementById('btnToggleSidebar');
    const sidebar = document.getElementById('sidebarDrawer');
    if (btnSidebar && sidebar) {
      btnSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        btnSidebar.classList.toggle('active', !sidebar.classList.contains('collapsed'));
      });
    }

    // Close / Reset Session button
    const btnClose = document.getElementById('btnClose');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.clearPaneOutput(1);
        this.clearPaneOutput(2);
        this.printWelcomeBanner(1);
      });
    }

    // Modal Close
    const btnCloseModal = document.getElementById('btnCloseModal');
    const modal = document.getElementById('gameModal');
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        if (window.matrixEngine) window.matrixEngine.stopModalMode();
        if (window.snakeGame) window.snakeGame.stop();
      });
    }
  }

  bindSidebarControls() {
    // Tab switching in sidebar
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const content = document.getElementById(targetId);
        if (content) content.classList.add('active');
      });
    });

    // Quick Command List Clicks
    const cmdItems = document.querySelectorAll('.quick-cmd-list li');
    cmdItems.forEach(item => {
      item.addEventListener('click', () => {
        const cmd = item.getAttribute('data-cmd');
        if (cmd) {
          const pane = this.panes[this.activePaneId];
          pane.inputEl.value = cmd;
          this.executeCommandForPane(this.activePaneId);
        }
      });
    });
  }

  bindPaneInputs(paneId) {
    const pane = this.panes[paneId];
    if (!pane.inputEl) return;

    // Focus switching
    pane.inputEl.addEventListener('focus', () => {
      this.activePaneId = paneId;
      document.querySelectorAll('.terminal-pane').forEach(p => p.classList.remove('active'));
      const activeEl = document.getElementById(`pane${paneId}`);
      if (activeEl) activeEl.classList.add('active');
    });

    pane.inputEl.addEventListener('keydown', (e) => {
      window.termAudio.playKeyClick();

      // Enter key -> Execute
      if (e.key === 'Enter') {
        e.preventDefault();
        window.termAudio.playEnterKey();
        this.executeCommandForPane(paneId);
        return;
      }

      // Up Arrow -> History prev
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (pane.history.length > 0) {
          if (pane.historyIdx === -1) pane.historyIdx = pane.history.length - 1;
          else if (pane.historyIdx > 0) pane.historyIdx--;
          pane.inputEl.value = pane.history[pane.historyIdx] || '';
          this.updateGhostAutocomplete(paneId);
        }
        return;
      }

      // Down Arrow -> History next
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (pane.historyIdx !== -1) {
          if (pane.historyIdx < pane.history.length - 1) {
            pane.historyIdx++;
            pane.inputEl.value = pane.history[pane.historyIdx];
          } else {
            pane.historyIdx = -1;
            pane.inputEl.value = '';
          }
          this.updateGhostAutocomplete(paneId);
        }
        return;
      }

      // Tab Key -> Autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTabAutocomplete(paneId);
        return;
      }

      // Ctrl+L -> Clear
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        this.clearPaneOutput(paneId);
        return;
      }

      setTimeout(() => this.updateGhostAutocomplete(paneId), 10);
    });
  }

  bindGlobalKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('gameModal');
        if (modal && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          if (window.matrixEngine) window.matrixEngine.stopModalMode();
          if (window.snakeGame) window.snakeGame.stop();
        }
      }
    });
  }

  executeCommandForPane(paneId) {
    const pane = this.panes[paneId];
    const rawVal = pane.inputEl.value;
    pane.inputEl.value = '';
    pane.ghostEl.textContent = '';
    pane.historyIdx = -1;

    // Append Command Echo Prompt line to output
    const promptPath = window.vfs.formatPath(pane.cwdParts);
    const echoHtml = `<div class="output-line cmd-echo"><span class="prompt-user">user@termx</span>:<span class="prompt-path">${promptPath}</span><span class="prompt-symbol">$</span> ${window.commandEngine.escapeHtml(rawVal)}</div>`;
    this.appendOutput(paneId, echoHtml);

    // Run Engine
    const result = window.commandEngine.execute(rawVal, pane);

    if (result.output === '__CLEAR__') {
      this.clearPaneOutput(paneId);
    } else if (result.output) {
      this.appendOutput(paneId, result.output);
    }

    // Update prompt path display
    pane.pathEl.textContent = window.vfs.formatPath(pane.cwdParts);

    // Update Status Bar info
    this.commandCount++;
    const statusCwd = document.getElementById('statusCwd');
    if (statusCwd) statusCwd.textContent = `PWD: ${window.vfs.getAbsoluteStr(pane.cwdParts)}`;

    const logCount = document.getElementById('sidebarLogCount');
    if (logCount) logCount.textContent = `${this.commandCount} commands executed`;
  }

  handleTabAutocomplete(paneId) {
    const pane = this.panes[paneId];
    const val = pane.inputEl.value;
    if (!val) return;

    const parts = val.split(' ');
    if (parts.length === 1) {
      // Command autocompletion
      const cmds = Object.keys(window.commandEngine.commands);
      const matches = cmds.filter(c => c.startsWith(val));
      if (matches.length === 1) {
        pane.inputEl.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        this.appendOutput(paneId, `<div class="output-line system">${matches.join('  ')}</div>`);
      }
    } else {
      // Path autocompletion
      const partialPath = parts[parts.length - 1];
      const matches = window.vfs.getCompletions(pane.cwdParts.join('/'), partialPath);
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        pane.inputEl.value = parts.join(' ');
      } else if (matches.length > 1) {
        this.appendOutput(paneId, `<div class="output-line system">${matches.join('  ')}</div>`);
      }
    }
  }

  updateGhostAutocomplete(paneId) {
    const pane = this.panes[paneId];
    const val = pane.inputEl.value;
    if (!val) {
      pane.ghostEl.textContent = '';
      return;
    }

    const cmds = Object.keys(window.commandEngine.commands);
    const match = cmds.find(c => c.startsWith(val) && c !== val);
    if (match) {
      pane.ghostEl.textContent = match;
    } else {
      pane.ghostEl.textContent = '';
    }
  }

  appendOutput(paneId, htmlContent) {
    const pane = this.panes[paneId];
    if (!pane.outputEl) return;
    pane.outputEl.insertAdjacentHTML('beforeend', htmlContent);
    pane.outputEl.scrollTop = pane.outputEl.scrollHeight;
  }

  clearPaneOutput(paneId) {
    const pane = this.panes[paneId];
    if (pane.outputEl) pane.outputEl.innerHTML = '';
  }

  renderFileTree() {
    const container = document.getElementById('fileExplorerTree');
    if (!container) return;

    const renderNode = (node, pathStr = '') => {
      let html = '';
      for (let name of Object.keys(node.children)) {
        const item = node.children[name];
        if (item.type === 'dir') {
          html += `<div class="tree-item directory"><span class="icon">📁</span> ${name}/</div>`;
          html += `<div style="padding-left:14px;">${renderNode(item, pathStr + '/' + name)}</div>`;
        } else {
          html += `<div class="tree-item file"><span class="icon">📄</span> ${name}</div>`;
        }
      }
      return html;
    };

    container.innerHTML = renderNode(window.vfs.root);
  }

  startSystemClock() {
    const clockEl = document.getElementById('statusTime');
    const update = () => {
      const now = new Date();
      if (clockEl) clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    };
    update();
    setInterval(update, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TermXApp();
  window.app.init();
});
