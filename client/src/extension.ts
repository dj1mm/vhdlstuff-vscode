
import * as path from 'path';
import * as vscode from 'vscode';

import * as language from 'vscode-languageclient';
import * as fs from 'fs';

let client: language.LanguageClient;

export function activate(context: vscode.ExtensionContext): void
{
    let vhdlstuff = vscode.workspace.getConfiguration('vhdlstuff');

    try
    {
        fs.accessSync(vhdlstuff.server, fs.constants.X_OK);
    }
    catch (err)
    {
        console.log(`Server executable is not accessible: '${vhdlstuff.server}'`);
        vscode.window.showErrorMessage(`Server executable not accessible. Please update vhdlstuff settings to enjoy VHDL language services.`);
        return;
    }
    console.log(`Server executable found: '${vhdlstuff.server}'`);

    let serverOptions: language.ServerOptions = {
        command: vhdlstuff.server,
        args: ["server"]
    };

    switch (vhdlstuff.verbosity) {
    case 'Trace':
    case 'Journal, Logfile and Trace':
        serverOptions.args.unshift(`--trace=${path.join("output.tra")}`);
        break;
    default:
        break;
    }

    switch (vhdlstuff.verbosity) {
    case 'Logfile':
        case 'Journal, Logfile and Trace':
        serverOptions.args.unshift(`--logfile=${path.join("output.log")}`);
        break;
    default:
        break;
    }

    switch (vhdlstuff.verbosity) {
    case 'Journal':
        case 'Journal, Logfile and Trace':
        serverOptions.args.push(`--journal=${path.join("output.jou")}`);
        break;
    default:
        break;
    }

    let clientOptions: language.LanguageClientOptions = {
        outputChannelName: 'Vhdlstuff',
        documentSelector: [{ scheme: 'file', language: 'vhdl' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/vhdl_properties.yaml')
        }
    };

    client = new language.LanguageClient('vhdlstuff', 'Vhdlstuff', serverOptions, clientOptions);
    client.start();

    console.log("Vhdlstuff initialised");
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
        return undefined;

    return client.stop();
}
