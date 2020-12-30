window.addEventListener("load", () => {
  const DEFAULT_VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
	gl_Position = vec4(a_position, 0, 1);
}`;

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
}`;

  const positions = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0];

  const canvas = document.getElementById("canvas");

  let W = canvas.clientWidth;
  let H = canvas.clientHeight;
  let lastTime = 0;
  let mouse = [0.5, 0.5];
  let text = DEFAULT_FRAGMENT_SHADER;
  let time = 0;

  let gl;

  const info = {
    position: null,
    mouse: null,
    resolution: null,
    time: null,
  };

  const code = document.getElementById("code");
  code.addEventListener("blur", handleBlur);
  code.innerHTML = text;

  function map(val, srcMin, srcMax, dstMin, dstMax) {
    const norm = (val - srcMin) / (srcMax - srcMin);
    return (dstMax - dstMin) * norm + dstMin;
  }

  function handleBlur(e) {
    if (e.target.innerHTML !== text) {
      text = e.target.innerHTML;
      update();
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();

    if (e.dataTransfer && e.dataTransfer.files) {
      const file = e.dataTransfer.files[0];

      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        if (reader.result) {
          text = reader.result;
          update();
        }
      });
      reader.readAsText(file);
    }
  }

  function handleMouseMove(e) {
    mouse[0] = map(e.pageX, 0, canvas.clientWidth, -1, 1);
    mouse[1] = map(e.pageY * -1, 0, -canvas.clientHeight, 1, -1);

    gl.uniform2f(info.mouse, mouse[0], mouse[1]);
  }

  function createProgram() {
    gl = canvas.getContext("webgl");

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
    gl.uniform2f(info.resolution, W, H);
  }

  function loop() {
    rafId = requestAnimationFrame(loop);

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

  function update() {
    if (text !== DEFAULT_FRAGMENT_SHADER) {
      cancelAnimationFrame(rafId);
      createProgram();
      createBuffers();
      setUniforms();
      loop();
    }
  }

  createProgram();
  createBuffers();
  setUniforms();

  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  document.addEventListener("mousemove", handleMouseMove, false);
  document.addEventListener("dragover", handleDragOver, false);
  document.addEventListener("drop", handleDrop, false);

  let rafId = requestAnimationFrame(loop);
});
