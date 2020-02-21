import React from "react";
import AceEditor from "react-ace-builds";
import "react-ace-builds/webpack-resolver-min";

function App() {
	const handleChange = e => {};

	// TODO:

	// + Initialize WebGL context

	// + Load default shader (in GL context and it's source in the editor)

	// + Add drag and drop support:

	// 		Drag fragment shader from desktop to canvas
	// 		Once the file loaded, render shader in gl context and load source in
	// 		ace editor

	// + Toggle editor visibilty
	// + Make it look nice
	// + Export/Import (re-use the dnd stuff for import)

	return (
		<div>
			<header>
				<h3>Title here</h3>
				<span>A description or something should go here</span>
			</header>

			<div className="main">
				<div className="editor">
					<span>TODO: toggle editor visibility</span>
					<AceEditor
						cursorStart={2}ḉ
						debounceChangePeriod={1000}
						fontSize={16}
						id="editor"
						mode="c_cpp" /* No GLSL mode for ace-editor !!! */
						onChange={handleChange}
						showPrintMargin={false}
						tabSize={2}
						theme="twilight"
						value="// Your code goes here..."
					/>
				</div>

				<div>
					<canvas id="canvas"></canvas>
				</div>
			</div>
		</div>
	);
}

export default App;
