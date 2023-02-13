# Dhivehi Keyboard

Add Windows-style Dhivehi keyboard layout to VSCode.

## How it works

If the currently active language is Dhivehi, it will swap out any English characters with their Dhivehi equivalents on Windows (Dhivehi phonetic) keyboard. Multicursor is also supported. Pasted text will not be affected. This will only work in open text editors (i.e. not in the terminal or other parts of the UI).

Currently active language for this extension is always visible on bottom left (status bar). This also functions as a button to switch input languages (or you can use the keyboard shortcut).

## Why

I forgot where the ޝ was on a Mac keyboard one too many times.

## Keyboard Shortcuts

| Description | Keyboard Shortcut |
| --- | --- |
| Switch between languages | `Alt + l`<br>`⌥ + l` |

## Config

| Name | Description | Default |
| --- | --- | --- |
| `dhivehiKeyboard.defaultInputLanguage` | Input language to use by default (on startup). | `en` |
| `dhivehiKeyboard.autoSwitch.enabled` | Enable/disable auto-switching to Dhivehi upon opening a file, based on file contents. | `false` |
| `dhivehiKeyboard.autoSwitch.threshold` | %age of file that must be in Dhivehi to trigger the auto-switch. | `50` |
