
import * as path from 'path';
import * as vscode from 'vscode';

import * as language from 'vscode-languageclient';
import * as fs from 'fs';

let client: language.LanguageClient;

export function activate(context: vscode.ExtensionContext): void
{
    let monika = vscode.workspace.getConfiguration('monika');

    try
    {
        fs.accessSync(monika.scratchpad, fs.constants.R_OK | fs.constants.W_OK);
    }
    catch (err)
    {
        console.log(`Scratchpad is not accessible: '${monika.scratchpad}'`);
        return;
    }
    console.log(`Scratchpad area found:   '${monika.scratchpad}'`)

    try
    {
        fs.accessSync(monika.server, fs.constants.X_OK);
    }
    catch (err)
    {
        console.log(`Server executable is not accessible: '${monika.server}'`);
        return;
    }
    console.log(`Server executable found: '${monika.server}'`)

    let serverOptions: language.ServerOptions = {
        command: monika.server,
        args: [`--logfile=${path.join(monika.scratchpad, "output.log")}`, "--stderr", "server"]
    };

    let clientOptions: language.LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'vhdl' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    client = new language.LanguageClient('monika', 'Monika', serverOptions, clientOptions);
    client.start();

    console.log("Monika initialised");
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
        return undefined;

        return client.stop();
}