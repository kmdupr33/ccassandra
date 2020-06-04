import * as vscode from "vscode";
import { StatusBarItem } from "./status-bar-item";
import { getEffort, FileEffortMap } from "./change-score";

export class Workspace {
  subscriptions: { dispose(): any }[] = [];
  constructor(
    private workspace: vscode.WorkspaceFolder,
    private statusBarItem: StatusBarItem
  ) {}

  dispose() {
    this.subscriptions.forEach((sub) => sub.dispose());
  }
  async activate() {
    this.statusBarItem.displayLoading();
    const map = await getEffort(this.path);
    this.statusBarItem.displayFinishedLoading();
    if (map === null) {
      this.statusBarItem.displayNoRepo();
    } else {
      this.updateItem(map, vscode.window.activeTextEditor?.document.fileName);
      this.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((event) => {
          const fileName = event?.document.fileName;
          this.updateItem(map, fileName);
        })
      );
    }
  }

  updateItem(map: FileEffortMap, fileName: string | undefined) {
    if (!fileName) {
      return;
    }
    const key = Object.keys(map).find((key) => fileName.includes(key));
    if (key) {
      const { changes, frequency } = map[key];
      this.statusBarItem.displayChanges(changes, frequency);
    }
  }

  get path() {
    return this.workspace.uri.path;
  }
}
