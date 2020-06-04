import * as vscode from "vscode";
import { ChangeFrequency } from "./change-score";

export class StatusBarItem {
  static make() {
    return new StatusBarItem(
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    );
  }
  constructor(private statusBarItem: vscode.StatusBarItem) {}

  show() {
    this.statusBarItem.show();
  }

  displayLoading() {
    this.statusBarItem.text = "Loading Change Scores...";
  }

  displayFinishedLoading() {
    this.statusBarItem.text =
      "Loading Complete. Select a file to see its change score.";
  }

  displayNoRepo() {
    this.statusBarItem.text = "No git repo found.";
  }

  displayChanges(changes: number, frequency: ChangeFrequency) {
    this.statusBarItem.text = `Changes: ${changes} Frequency: ${frequency}`;
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}
