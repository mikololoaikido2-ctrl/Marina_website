/* ==========================================================================
   TERMX - VIRTUAL FILE SYSTEM MODULE
   Hierarchical file structure, path resolution, directory traversal & permissions
   ========================================================================== */

class VirtualFileSystem {
  constructor() {
    this.root = {
      type: 'dir',
      name: '/',
      children: {
        'bin': {
          type: 'dir',
          children: {
            'neofetch': { type: 'file', content: 'ELF 64-bit LSB executable, x86-64', executable: true },
            'htop': { type: 'file', content: 'ELF 64-bit LSB executable, x86-64', executable: true },
            'snake': { type: 'file', content: 'ELF 64-bit LSB executable, x86-64', executable: true }
          }
        },
        'home': {
          type: 'dir',
          children: {
            'user': {
              type: 'dir',
              children: {
                'projects': {
                  type: 'dir',
                  children: {
                    'quantum-core': {
                      type: 'dir',
                      children: {
                        'main.py': { type: 'file', content: '# Quantum State Engine v2.4\nimport math\n\ndef simulate_qubit(theta, phi):\n    return f"|Ψ⟩ = cos({theta}/2)|0⟩ + e^i{phi} sin({theta}/2)|1⟩"\n\nif __name__ == "__main__":\n    print(simulate_qubit(math.pi / 2, 0.0))\n' },
                        'config.json': { type: 'file', content: '{\n  "version": "2.4.0",\n  "qubits": 64,\n  "precision": "double",\n  "backend": "GPU-CUDA-12"\n}\n' }
                      }
                    },
                    'neural-net': {
                      type: 'dir',
                      children: {
                        'model.js': { type: 'file', content: '// Transformer Model weights placeholder\nconsole.log("Loading Transformer Tensor Weights...");\n' }
                      }
                    }
                  }
                },
                'documents': {
                  type: 'dir',
                  children: {
                    'notes.txt': { type: 'file', content: 'TermX v4.0 Deployment Checklist:\n- [x] Configure CSS custom themes\n- [x] Add mechanical keyboard audio clicks\n- [x] Implement dual split-pane view\n- [x] Add process manager (htop)\n- [x] Test Matrix digital rain canvas\n' },
                    'passwords.gpg': { type: 'file', content: '-----BEGIN PGP MESSAGE-----\nhQEMA9... [ENCRYPTED - Sudo privileges required to view]\n-----END PGP MESSAGE-----' }
                  }
                },
                'logs': {
                  type: 'dir',
                  children: {
                    'system.log': { type: 'file', content: '[2026-08-09 18:00:01] INFO  Kernel boot complete. Node online.\n[2026-08-09 18:00:05] INFO  Network interface wlan0 connected. IP 192.168.1.104\n[2026-08-09 18:15:22] WARN  High memory utilization detected: 48%\n' }
                  }
                },
                'readme.txt': { type: 'file', content: '===================================================\n  TERMX INTERACTIVE SIMULATOR\n===================================================\nWelcome to TermX! Type "help" to see all available\ncommands. Explore the filesystem, run "neofetch",\nlaunch "htop", or enter "matrix" mode!\n' }
              }
            }
          }
        },
        'sys': {
          type: 'dir',
          children: {
            'kernel': { type: 'file', content: 'Linux termx-hypervisor 6.8.0-42-generic #42-Ubuntu SMP PREEMPT_DYNAMIC' },
            'uptime': { type: 'file', content: '15159.23' }
          }
        }
      }
    };
  }

  // Traverse to a node given an absolute path array
  getNode(pathArr) {
    let current = this.root;
    for (let part of pathArr) {
      if (!part || part === '.') continue;
      if (current.type !== 'dir') return null;
      if (!current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  }

  // Parse path string relative to current working directory
  resolvePathParts(cwdPath, targetPathStr) {
    let parts = [];
    if (targetPathStr.startsWith('/')) {
      parts = targetPathStr.split('/').filter(Boolean);
    } else if (targetPathStr.startsWith('~')) {
      const homeRel = targetPathStr.substring(1).split('/').filter(Boolean);
      parts = ['home', 'user', ...homeRel];
    } else {
      const cwdParts = cwdPath.split('/').filter(Boolean);
      const targetParts = targetPathStr.split('/').filter(Boolean);
      parts = [...cwdParts];

      for (let p of targetParts) {
        if (p === '.') continue;
        if (p === '..') {
          if (parts.length > 0) parts.pop();
        } else {
          parts.push(p);
        }
      }
    }
    return parts;
  }

  formatPath(parts) {
    if (parts.length === 0) return '/';
    if (parts.length >= 2 && parts[0] === 'home' && parts[1] === 'user') {
      const rest = parts.slice(2).join('/');
      return rest ? `~/${rest}` : '~';
    }
    return '/' + parts.join('/');
  }

  getAbsoluteStr(parts) {
    if (parts.length === 0) return '/';
    return '/' + parts.join('/');
  }

  listDir(cwdPath, dirStr = '') {
    const parts = this.resolvePathParts(cwdPath, dirStr);
    const node = this.getNode(parts);
    if (!node) {
      return { success: false, error: `ls: cannot access '${dirStr}': No such file or directory` };
    }
    if (node.type !== 'dir') {
      return { success: false, error: `ls: '${dirStr}': Not a directory` };
    }

    const items = Object.keys(node.children).map(name => {
      const item = node.children[name];
      return {
        name,
        type: item.type,
        executable: item.executable || false,
        size: item.content ? item.content.length : (item.children ? Object.keys(item.children).length * 4096 : 0)
      };
    });

    return { success: true, items, path: this.formatPath(parts) };
  }

  readFile(cwdPath, fileStr) {
    const parts = this.resolvePathParts(cwdPath, fileStr);
    const node = this.getNode(parts);
    if (!node) {
      return { success: false, error: `cat: ${fileStr}: No such file or directory` };
    }
    if (node.type === 'dir') {
      return { success: false, error: `cat: ${fileStr}: Is a directory` };
    }
    return { success: true, content: node.content };
  }

  createFile(cwdPath, fileStr, content = '') {
    const parts = this.resolvePathParts(cwdPath, fileStr);
    const fileName = parts.pop();
    const parentNode = this.getNode(parts);
    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `touch: cannot create file '${fileStr}': No such directory` };
    }
    parentNode.children[fileName] = { type: 'file', content };
    return { success: true };
  }

  makeDir(cwdPath, dirStr) {
    const parts = this.resolvePathParts(cwdPath, dirStr);
    const dirName = parts.pop();
    const parentNode = this.getNode(parts);
    if (!parentNode || parentNode.type !== 'dir') {
      return { success: false, error: `mkdir: cannot create directory '${dirStr}': No such directory` };
    }
    if (parentNode.children[dirName]) {
      return { success: false, error: `mkdir: cannot create directory '${dirName}': File exists` };
    }
    parentNode.children[dirName] = { type: 'dir', children: {} };
    return { success: true };
  }

  removeNode(cwdPath, targetStr) {
    const parts = this.resolvePathParts(cwdPath, targetStr);
    const itemName = parts.pop();
    const parentNode = this.getNode(parts);
    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children[itemName]) {
      return { success: false, error: `rm: cannot remove '${targetStr}': No such file or directory` };
    }
    delete parentNode.children[itemName];
    return { success: true };
  }

  getCompletions(cwdPath, partialStr) {
    let lastSlashIndex = partialStr.lastIndexOf('/');
    let dirPart = lastSlashIndex !== -1 ? partialStr.substring(0, lastSlashIndex + 1) : '';
    let filePart = lastSlashIndex !== -1 ? partialStr.substring(lastSlashIndex + 1) : partialStr;

    const parts = this.resolvePathParts(cwdPath, dirPart || '.');
    const node = this.getNode(parts);
    if (!node || node.type !== 'dir') return [];

    const matches = [];
    for (let name of Object.keys(node.children)) {
      if (name.startsWith(filePart)) {
        const item = node.children[name];
        matches.push(dirPart + name + (item.type === 'dir' ? '/' : ''));
      }
    }
    return matches;
  }
}

window.vfs = new VirtualFileSystem();
