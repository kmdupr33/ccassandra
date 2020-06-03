// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getEffort, FileEffortMap } from "./change-score";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate({ subscriptions }: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  item.text = "Loading...";
  item.show();

  const map = await getEffort(vscode.workspace.workspaceFolders![0].uri.path);

  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((event) => {
      const fileName = event?.document.fileName;
      if (fileName) {
        updateItem(map, fileName, item);
      }
    })
  );

  item.text = "Done Loading :)";
  subscriptions.push(item);
}

function updateItem(
  map: FileEffortMap,
  fileName: string,
  item: vscode.StatusBarItem
) {
  const key = Object.keys(map).find((key) => fileName.includes(key));
  if (key) {
    const info = map[key];
    item.text = `Changes: ${info.changes} Frequency: ${info.frequency}`;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
