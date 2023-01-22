const { spawn } = require('child_process');
const vscode = require('vscode');

class OutputRunner {

  constructor() {
    this.channel = null;
    this.process = undefined;
    this.isRunning = false;
  }

  run() {
    if (this.channel === null) {
      this.channel = vscode.window.createOutputChannel('JavaScript', 'json');
    }
    this.channel.show(true);

    let editor =  vscode.window.activeTextEditor;
    try {
      editor.document.save().then(
        () => {
          this.execute(editor.document.fileName);
        }
        );
    } catch (error) {}
  }

  async stop() {
    this.process.kill();
    await vscode.commands.executeCommand('setContext', 'js-code-runner.isRunning', false);
    this.isRunning = false;
  }

  execute(fileName) {
    fileName = fileName.replace(/\\/g, '/')
    if (this.isRunning) {
      vscode.window.showInformationMessage('running');
      return;
    }
    let clearPrev = vscode.workspace.getConfiguration('js-code-runner').get('clearPreviousOutput');
    if (clearPrev) this.channel.clear();
    let executor = vscode.workspace.getConfiguration('js-code-runner').get('executor');
    this.channel.appendLine(`[Running] ${executor} "${fileName}"\n`);
    this.process = spawn(executor, [`${fileName}`]);
    const startTime = new Date().getTime();
    vscode.commands.executeCommand('setContext', 'js-code-runner.isRunning', true)
    .then(() => this.isRunning = true);

    this.process.stdout.on('data', data => {
      this.channel.append(data.toString());
    });

    this.process.stderr.on('data', data => {
      this.channel.append(data.toString());
    });

    this.process.on('close', code => {
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      this.channel.appendLine(`\n[Done] exitCode=${code} duration=${duration}ms\n`);
      vscode.commands.executeCommand('setContext', 'js-code-runner.isRunning', false)
      .then(() => {
        this.isRunning = false
      });
    });
  }
}

module.exports = {
  OutputRunner
}
