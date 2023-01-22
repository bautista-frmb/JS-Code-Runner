const vscode = require('vscode');

class TerminalRunner {

  constructor() {
    this.terminal = null;
  }

  run() {
    if (this.terminal === null) this.terminal = vscode.window.createTerminal('JavaScript');
    this.terminal.show();

    let editor =  vscode.window.activeTextEditor;
    try {
      editor.document.save().then(
        () => {
          let executor = vscode.workspace.getConfiguration('js-code-runner').get('executor');
          let clearPrev = vscode.workspace.getConfiguration('js-code-runner').get('clearPreviousOutput');
          if (clearPrev) this.terminal.sendText('cls');
          this.terminal.sendText(`${executor} "${editor.document.fileName}"`);
        }
        );
    } catch (error) {}
  }

  stop() {
    if (this.terminal != null) {
      this.terminal.sendText('\u0003', false);
    }
  }
}

module.exports = {
  TerminalRunner
}
