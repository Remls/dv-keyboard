"use strict";

import * as vscode from "vscode";
import { CHARACTER_MAP, MapInterface } from "./map";

const INPUT_LANGUAGES: MapInterface = {
  en: "English",
  dv: "Dhivehi",
};

let fileChangeListener: vscode.Disposable;
let fileOpenListener: vscode.Disposable;
let statusBarItem: vscode.StatusBarItem;
let currentInputLanguage: string;

function createStatusBarItem() {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  statusBarItem.command = "remls.switchInputLanguage";
  statusBarItem.tooltip = "Switch input language";
  statusBarItem.text = "$(keyboard) " + INPUT_LANGUAGES[currentInputLanguage];
  statusBarItem.show();
}

function updateLanguage(newLanguage: string, reason?: string) {
  currentInputLanguage = newLanguage;
  const newLanguageFull = INPUT_LANGUAGES[newLanguage];
  statusBarItem.text = `$(keyboard) ${newLanguageFull}`;
  let message = `Input language changed to ${newLanguageFull}`;
  const items = [];
  if (reason) {
    message = message + ` (${reason})`;
    items.push("Switch back");
  }
  message = message + ".";
  vscode.window.showInformationMessage(message, ...items).then((item) => {
    if (item === "Switch back") {
      const otherLanguage = newLanguage === "en" ? "dv" : "en";
      updateLanguage(otherLanguage);
    }
  });
}

export function activate(context: vscode.ExtensionContext) {
  // Get default language from config
  const config = vscode.workspace.getConfiguration("dhivehiKeyboard");
  const defaultLanguage = config.get("defaultInputLanguage") as string;
  if (defaultLanguage) {
    currentInputLanguage = defaultLanguage;
  }

  createStatusBarItem();

  context.subscriptions.push(
    vscode.commands.registerCommand("remls.switchInputLanguage", () => {
      if (currentInputLanguage === "en") {
        updateLanguage("dv");
      } else {
        updateLanguage("en");
      }
    })
  );

  fileOpenListener = vscode.workspace.onDidOpenTextDocument((e) => {
    const autoSwitchEnabled = config.get("autoSwitch.enabled") as boolean;
    if (!autoSwitchEnabled) {
      return;
    }

    let autoSwitchThreshold = config.get("autoSwitch.threshold") as number;
    if (!autoSwitchThreshold || autoSwitchThreshold < 0 || autoSwitchThreshold > 100) {
      autoSwitchThreshold = 50;
    }

    if (currentInputLanguage === "dv") {
      return;
    }
    const totalCount = e.getText().length;
    if (totalCount === 0) {
      return;
    }

    // If 50% of the file is in Dhivehi, change to Dhivehi
    const dvChars = Object.values(CHARACTER_MAP);
    const dvCount = e
      .getText()
      .split("")
      .filter((char) => dvChars.includes(char)).length;
    const dvRatio = (dvCount / totalCount) * 100;
    if (dvRatio >= autoSwitchThreshold) {
      updateLanguage(
        "dv",
        `automatically based on file contents (${dvRatio.toFixed(2)}% Dhivehi > ${autoSwitchThreshold}% threshold)`
      );
    }
  });

  fileChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
    if (currentInputLanguage !== "dv") {
      return;
    }

    // Do nothing if no open text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    // Do nothing if the change is not in the current editor
    if (editor.document.uri.toString() !== e.document.uri.toString()) {
      return;
    }

    e.contentChanges.forEach((change) => {
      const lastChar = change.text;
      if (!lastChar) {
        return;
      }
      if (lastChar.length > 1) {
        // Do nothing if the change is not a single character (e.g. paste)
        return;
      }
      const lastCharReplacement = CHARACTER_MAP[lastChar];
      if (!lastCharReplacement) {
        return;
      }
      const lastCharPosition = change.range.start;
      const lastCharRange = new vscode.Range(
        lastCharPosition,
        lastCharPosition.translate(0, 1) // All changes handled here are single characters
      );
      editor.edit((edit) => {
        edit.replace(lastCharRange, lastCharReplacement);
      });
    });
  });
}

export function deactivate() {
  fileOpenListener.dispose();
  fileChangeListener.dispose();
}
