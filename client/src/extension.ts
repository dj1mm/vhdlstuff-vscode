
import * as path from 'path';
import * as vscode from 'vscode';

import * as language from 'vscode-languageclient';
import * as fs from 'fs';

let client: language.LanguageClient;

export function activate(context: vscode.ExtensionContext): void
{
    let vhdlstuff = vscode.workspace.getConfiguration('vhdlstuff');
    let scratchpad: string | undefined = `${vhdlstuff.scratchpad}`;

    try
    {
        fs.accessSync(vhdlstuff.scratchpad, fs.constants.R_OK | fs.constants.W_OK);
        console.log(`Scratchpad area found:   '${vhdlstuff.scratchpad}'`);
    }
    catch (err)
    {
        console.log(`Scratchpad is not accessible: '${vhdlstuff.scratchpad}'`);
        scratchpad = undefined;
    }

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
    if (scratchpad != undefined)
        serverOptions.args.unshift(`--logfile=${path.join(scratchpad, "output.log")}`)

    // If for some debugging reason vhdlstuff needs to dump its standard input
    // and output, uncomment the following line will do just that:
    // serverOptions.args.push(`--journal=<path where to write the journal>`)

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
