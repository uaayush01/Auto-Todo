const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const TODO_FILE_NAME = 'todo.txt';
const DEADLINE_TRIGGER_LINE = '[Click here to set a deadline]';

function activate(context) {
  //  Create the todo.txt file if it doesn't exist
  if (vscode.workspace.workspaceFolders) {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const todoFilePath = path.join(workspacePath, TODO_FILE_NAME);

    if (!fs.existsSync(todoFilePath)) {
      const defaultContent = `# Project TODO List

- [ ] Initialize project repo
- [ ] Install dependencies
- [ ] Write initial code
- [ ] Test basic features

────────────────────────────

${DEADLINE_TRIGGER_LINE}
`;
      fs.writeFileSync(todoFilePath, defaultContent);

      // Open the file after creation
      const openPath = vscode.Uri.file(todoFilePath);
      vscode.workspace.openTextDocument(openPath).then(doc => {
        vscode.window.showTextDocument(doc);
      });
    }
  }

  //  Register CodeLens Provider for todo.txt
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ pattern: '**/todo.txt' }, new DeadlineCodeLensProvider())
  );

  //  Register the deadline command
  const setDeadlineCommand = vscode.commands.registerCommand('todoFileCreator.setDeadline', async () => {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter your project deadline (YYYY-MM-DD)',
      placeHolder: '2025-06-01'
    });

    if (input) {
      const deadlinePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'deadline.json');
      fs.mkdirSync(path.dirname(deadlinePath), { recursive: true });
      fs.writeFileSync(deadlinePath, JSON.stringify({ deadline: input }, null, 2));

      vscode.window.showInformationMessage(`Deadline set for ${input}`);
    }
  });

  context.subscriptions.push(setDeadlineCommand);

  //  On workspace open, check if today is deadline day
  if (vscode.workspace.workspaceFolders) {
    const deadlinePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'deadline.json');
    if (fs.existsSync(deadlinePath)) {
      const data = JSON.parse(fs.readFileSync(deadlinePath, 'utf8'));
      const today = new Date().toISOString().split('T')[0];

      if (data.deadline === today) {
        vscode.window.showWarningMessage('⚠️ Today is your project deadline!');
      }
    }
  }
}

class DeadlineCodeLensProvider {
  provideCodeLenses(document) {
    const lenses = [];
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      if (line.text.includes(DEADLINE_TRIGGER_LINE)) {
        lenses.push(new vscode.CodeLens(line.range, {
          title: 'Set Deadline',
          command: 'todoFileCreator.setDeadline',
        }));
      }
    }
    return lenses;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
