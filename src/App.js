import React, { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
	gl_Position = vec4(a_position, 0, 1);
}
`;

const DEFAULT_FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
	vec2 pos = -1.0 + 2.0 * (gl_FragCoord.xy / u_resolution.xy);

	float r = pos.x * cos(u_time) - pos.y * sin(u_time);
	float g = pos.y * sin(u_time) - pos.x * cos(u_time);
	float b = pos.x * cos(u_time) + pos.y * sin(u_time);


	gl_FragColor = vec4(r, g, b, 1.0);
}
`;

const positions = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0];

function App() {
	const editorRef = useRef();
	const canvasRef = useRef();
	const rafRef = useRef();
	const W = useRef(0);
	const H = useRef(0);

	let gl;
	let lastTime = 0;
	let mouse = [0.5, 0.5];
	let time = 0;

	const [text, setText] = useState(DEFAULT_FRAGMENT_SHADER);

	const info = {
		position: null,
		mouse: null,
		resolution: null,
		time: null,
	};

	function createProgram() {
		gl = canvasRef.current.getContext("webgl");

		const prog = gl.createProgram();

		let sh;

		gl.shaderSource(
			(sh = gl.createShader(gl.VERTEX_SHADER)),
			DEFAULT_VERTEX_SHADER
		);
		gl.compileShader(sh);
		gl.attachShader(prog, sh);

		gl.shaderSource((sh = gl.createShader(gl.FRAGMENT_SHADER)), text);
		gl.compileShader(sh);
		gl.attachShader(prog, sh);

		gl.linkProgram(prog);
		gl.useProgram(prog);

		info.position = gl.getAttribLocation(prog, "a_position");
		info.mouse = gl.getUniformLocation(prog, "u_mouse");
		info.resolution = gl.getUniformLocation(prog, "u_resolution");
		info.time = gl.getUniformLocation(prog, "u_time");
	}

	function createBuffers() {
		gl.enableVertexAttribArray(info.position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		gl.vertexAttribPointer(info.position, 2, gl.FLOAT, gl.FALSE, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
	}

	function setUniforms() {
		gl.uniform1f(info.time, time);
		gl.uniform2f(info.mouse, mouse[0], mouse[1]);
		gl.uniform2f(info.resolution, W.current, H.current);
	}

	function loop() {
		rafRef.current = requestAnimationFrame(loop);

		const now = Date.now();
		if (lastTime) {
			const elapsed = now - lastTime;

			time += (2.0 * elapsed) / 1000.0;
		}
		lastTime = now;
		draw();
	}

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		time += 0.01;
		gl.uniform1f(info.time, time);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
	}

	const handleMouseMove = useCallback((e) => {
		mouse[0] = e.pageX;
		mouse[1] = e.pageY * -1;

		gl.uniform2f(info.mouse, mouse[0], mouse[1]);
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	useEffect(() => {
		W.current = canvasRef.current.clientWidth;
		H.current = canvasRef.current.clientHeight;

		createProgram();
		createBuffers();
		setUniforms();

		gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

		rafRef.current = requestAnimationFrame(loop);

		// TODO: drag and drop

		document.addEventListener("mousemove", handleMouseMove, false);

		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			document.removeEventListener("mousemove", handleMouseMove);
		};
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	function handleBlur(e) {
		if (e.target.innerHTML !== text) {
			setText(e.target.innerHTML);
		}
	}

	useEffect(() => {
		if (text !== DEFAULT_FRAGMENT_SHADER) {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			createProgram();
			createBuffers();
			setUniforms();
			loop();
		}
	}, [text]);

	return (
		<div className="main">
			<canvas ref={canvasRef}></canvas>
			<div className="editor">
				<pre>
					<code
						contentEditable={true}
						dangerouslySetInnerHTML={{ __html: text }}
						ref={editorRef}
						onBlur={handleBlur}
					></code>
				</pre>
			</div>
		</div>
	);
}

export default App;
