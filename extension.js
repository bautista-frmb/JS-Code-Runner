"use-strict"

const vscode = require('vscode');
const { TerminalRunner } = require('./runmanagers/TerminalRunner');
const { OutputRunner } = require('./runmanagers/OutputRunner');

function activate(context) {
  
  const terminalRunner = new TerminalRunner();
  const outputRunner = new OutputRunner();

  if (vscode.workspace.getConfiguration('js-code-runner').get('runInTerminal')) {
    let terminals = vscode.window.terminals;
    if (terminals.length != 0) {
      for (const t of terminals) {
        if (t.name === 'JavaScript') {
          terminalRunner.terminal = t;
          terminalRunner.terminal.show();
          break;
        }
      }
    }
  }

  let run = vscode.commands.registerCommand('js-code-runner.run', () => {
    if (vscode.workspace.getConfiguration('js-code-runner').get('runInTerminal')) {
      terminalRunner.run();
    } else {
      outputRunner.run();
    }
  });

  let stop = vscode.commands.registerCommand('js-code-runner.stop', () => {
    if (vscode.workspace.getConfiguration('js-code-runner').get('runInTerminal')) {
      terminalRunner.stop();
    } else {
      outputRunner.stop();
    }
  });

  let restart = vscode.commands.registerCommand('js-code-runner.restart', () => {
    outputRunner.stop().then(() => {
      outputRunner.run();
    });
  });;

  vscode.window.onDidCloseTerminal(() => {
    terminalRunner.terminal = null;
  });

  context.subscriptions.push(run);
  context.subscriptions.push(stop);
  context.subscriptions.push(restart);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
