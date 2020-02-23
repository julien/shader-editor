import React, { useEffect, useRef } from "react";

const DEFAULT_VERTEX_SHADER = `
attribute vec2 p;

void main() {
	gl_Position = vec4(p, 0, 1);
}
`;

const DEFAULT_FRAGMENT_SHADER = `
void main() {
	gl_FragColor = vec4(.3, .3, .2, 1.);
}
`;

function App() {
	const editorRef = useRef();
	const canvasRef = useRef();
	let gl;

	function initGL() {
		gl = canvasRef.current.getContext("webgl");

		const prog = gl.createProgram();

		let sh;

		gl.shaderSource(
			(sh = gl.createShader(gl.VERTEX_SHADER)),
			DEFAULT_VERTEX_SHADER
		);
		gl.compileShader(sh);
		gl.attachShader(prog, sh);

		gl.shaderSource(
			(sh = gl.createShader(gl.FRAGMENT_SHADER)),
			DEFAULT_FRAGMENT_SHADER
		);
		gl.compileShader(sh);
		gl.attachShader(prog, sh);

		gl.linkProgram(prog);
		gl.useProgram(prog);
	}

	useEffect(() => {
		initGL();
	}, []);

	return (
		<div>
			<div className="main">
				<div className="editor">
					<pre>
						<code
							contentEditable={true}
							dangerouslySetInnerHTML={{ __html: DEFAULT_FRAGMENT_SHADER }}
							ref={editorRef}
						></code>
					</pre>
				</div>
				<canvas ref={canvasRef}></canvas>
			</div>
		</div>
	);
}

export default App;
