"use strict";

import * as vscode from "vscode";
import { CHARACTER_MAP, MapInterface } from "./map";

const INPUT_LANGUAGES: MapInterface = {
  en: "English",
  dv: "Dhivehi",
};

let listener: vscode.Disposable;
let statusBarItem: vscode.StatusBarItem;
let currentInputLanguage = "en";

function createStatusBarItem() {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.command = "remls.switchInputLanguage";
  statusBarItem.tooltip = "Switch input language";
  statusBarItem.text = "$(keyboard) " + INPUT_LANGUAGES[currentInputLanguage];
  statusBarItem.show();
}

function updateLanguage(newLanguage: string) {
  currentInputLanguage = newLanguage;
  const newLanguageFull = INPUT_LANGUAGES[newLanguage];
  statusBarItem.text = `$(keyboard) ${newLanguageFull}`;
  vscode.window.showInformationMessage(`Input language changed to ${newLanguageFull}.`);
}

export function activate(context: vscode.ExtensionContext) {
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

  listener = vscode.workspace.onDidChangeTextDocument((e) => {
    if (currentInputLanguage !== "dv") {
      return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const lastChange = e.contentChanges[e.contentChanges.length - 1];
    const lastChar = lastChange.text;
    const lastCharReplacement = CHARACTER_MAP[lastChar];
    if (!lastCharReplacement) {
      return;
    }
    const lastCharPosition = lastChange.range.end;
    const lastCharRange = new vscode.Range(
      lastCharPosition,
      lastCharPosition.translate(0, 1)
    );
    editor.edit((edit) => {
      edit.replace(lastCharRange, lastCharReplacement);
    });
  });
}

export function deactivate() {
  listener.dispose();
}
