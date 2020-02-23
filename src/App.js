import React, { useEffect, useRef, useCallback } from "react";

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

	let gl,
		lastTime = 0,
		u_mouse = [0.5, 0.5],
		u_time = 0;

	const info = {
		a_position: null,
		u_mouse: null,
		u_resolution: null,
		u_time: null
	};

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

		info.a_position = gl.getAttribLocation(prog, "a_position");
		info.u_mouse = gl.getUniformLocation(prog, "u_mouse");
		info.u_resolution = gl.getUniformLocation(prog, "u_resolution");
		info.u_time = gl.getUniformLocation(prog, "u_time");
	}

	function initBuffers() {
		gl.enableVertexAttribArray(info.a_position);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		gl.vertexAttribPointer(info.a_position, 2, gl.FLOAT, gl.FALSE, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
	}

	function setUniforms() {
		gl.uniform1f(info.u_time, u_time);
		gl.uniform2f(info.u_mouse, u_mouse[0], u_mouse[1]);
		gl.uniform2f(info.u_resolution, W.current, H.current);
	}

	function loop() {
		rafRef.current = requestAnimationFrame(loop);

		const now = new Date().getTime();
		if (lastTime) {
			const elapsed = now - lastTime;

			u_time += (2.0 * elapsed) / 1000.0;
		}
		lastTime = now;
		draw();
	}

	function draw() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		u_time += 0.01;
		gl.uniform1f(info.u_time, u_time);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
	}

	const handleMouseMove = useCallback(e => {
		u_mouse[0] = e.pageX;
		u_mouse[1] = e.pageY * -1;

		gl.uniform2f(info.u_mouse, u_mouse[0], u_mouse[1]);
		/* eslint-disable react-hooks/exhaustive-deps */
	}, []);

	useEffect(() => {
		W.current = canvasRef.current.clientWidth;
		H.current = canvasRef.current.clientHeight;

		initGL();
		initBuffers();
		setUniforms();

		gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

		rafRef.current = requestAnimationFrame(loop);

		// TODO:
		// add drag and drop
		// reload of drop

		document.addEventListener("mousemove", handleMouseMove, false);

		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			document.removeEventListener("mousemove", handleMouseMove);
		};
		/* eslint-disable react-hooks/exhaustive-deps */
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
