const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    checkAndCreateTodoFile();

    // Watch for workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
        checkAndCreateTodoFile();
    });
}

function checkAndCreateTodoFile() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
        workspaceFolders.forEach(folder => {
            const rootPath = folder.uri.fsPath;
            const todoFilePath = path.join(rootPath, 'todo.txt');

            // Check if file exists
            if (!fs.existsSync(todoFilePath)) {
                fs.writeFile(todoFilePath, '', (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(
                            `Failed to create todo.txt in ${rootPath}: ${err.message}`
                        );
                    } else {
                        vscode.window.showInformationMessage(
                            `Created todo.txt in ${folder.name} workspace`
                        );
                    }
                });
            }
        });
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};