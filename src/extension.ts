// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { FileEffortMap } from "./change-score";
import { StatusBarItem } from "./status-bar-item";
import { Workspace } from "./workspace";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate({ subscriptions }: vscode.ExtensionContext) {
  const item = StatusBarItem.make();
  item.show();

  let activeWorkspace = await activateWorkspace(
    item,
    vscode.workspace.workspaceFolders?.[0]
  );
  subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
      activeWorkspace?.dispose();
      activeWorkspace = await activateWorkspace(item, event.added[0]);
    })
  );

  subscriptions.push(item);
}

async function activateWorkspace(
  item: StatusBarItem,
  workspace: vscode.WorkspaceFolder | undefined
) {
  if (!workspace) {
    return;
  }
  const wrappedWorkspace = new Workspace(workspace, item);
  wrappedWorkspace.activate();
  return wrappedWorkspace;
}

// this method is called when your extension is deactivated
export function deactivate() {}
