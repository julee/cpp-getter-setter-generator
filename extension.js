// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "getter-setter-generator" is now active!');

	function command(subCmd) {
		// get the currently open file
		const editor = vscode.window.activeTextEditor;
		// if no editor is open, do nothing
		if (!editor) {
			return;
		}
		let language = vscode.window.activeTextEditor.document.languageId;
		if (language !== 'cpp') {
			vscode.window.showInformationMessage('Only c++ language is supported!')
			return;
		}
		const hasSelection = !editor.selection.isEmpty;
		// check if the user selected something, otherwise display error message
		if (!hasSelection) {
			vscode.window.showErrorMessage('Nothing was selected!');
			return;
		}
		let text = editor.document.getText(editor.selection);
		let generatedCode;
		generatedCode = generateGetterSetterAutomatically(text, subCmd);			

		// gets the current editor and appends the getters/setters 
		editor.edit(
			edit => editor.selections.forEach(
				selection => {
					edit.insert(selection.end, generatedCode);
				}
			)
		);
	}
	
	let generateGetterSetter = vscode.commands.registerCommand('extension.cppGenerateGetterSetter', function () {
		command('both');
	});
	let generateGetter = vscode.commands.registerCommand('extension.cppGenerateGetter', function () {
		command('getter');
	});
	let generateSetter = vscode.commands.registerCommand('extension.cppGenerateSetter', function () {
		command('setter');
	});
	context.subscriptions.push(generateGetterSetter);
	context.subscriptions.push(generateGetter);
	context.subscriptions.push(generateSetter);
}
exports.activate = activate;


function generateGetterSetterAutomatically(text, returnableType){
	let selectedTextArray = text.split('\r\n').filter(e => e);
	let generatedCode = '';

	for (const text of selectedTextArray) {
		let selectedText, indentSize, variableType, variableName;
		selectedText = text.replace(';', '').trim();
		indentSize = text.split(selectedText.charAt(0))[0].length;
		variableType = selectedText.split(/\s/)[0];
		variableName = selectedText.split(/\s/)[1];	
		if (variableName.charAt(0) == '*') {
			variableType += ' *';
			variableName = variableName.substr(1);
		}
		else if (variableName.charAt(0) == '&') {
			variableType += ' &';
			variableName = variableName.substr(1);
		}
		else {
			variableType += ' ';
		}
			
		if (variableName === null || variableName === undefined) {
			vscode.window.showErrorMessage('No variable selected!')
			return; 
		}
		variableName.trim();
		variableType.trim();
		
		let code = '';
		var pureName = variableName;
		if (variableName.endsWith('_')) {
			pureName = variableName.substr(0, variableName.length - 1);
		}
		else if (variableName.startsWith('m') && variableName.charAt(1).toUpperCase() == variableName.charAt(1)) {
			pureName = variableName.substr(1);
			pureName = pureName.charAt[0].toLowerCase() + pureName.substr(1);
		}
		let pureNameUp = pureName.charAt(0).toUpperCase() + pureName.substr(1);
		var getter = '\n'
		getter += ' '.repeat(indentSize) + variableType + 'Get' + pureNameUp + '() const {\n';
		getter += ' '.repeat(indentSize * 2) + 'return ' + variableName + ';\n';
		getter += ' '.repeat(indentSize) + '}\n'  
		var setter = '\n'
		setter += ' '.repeat(indentSize) + 'void Set' + pureNameUp + '(' + variableType + '' + pureName  + ') {\n';
		setter += ' '.repeat(indentSize * 2) + variableName + ' = ' + pureName + ';\n';
		setter += ' '.repeat(indentSize) + '}\n'  
		if (returnableType === "both") {
			code = getter + setter;		
		} else if (returnableType === "getter"){
			code = getter;			
		} else if (returnableType === "setter"){
			code = setter;			
		}
		generatedCode += code; //append the code for each selected line
	}
	return generatedCode;
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
