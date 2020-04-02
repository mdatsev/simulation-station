import { Simulation } from '../Simulation.js'
import { ShaderLayer } from '../ShaderLayer.js'

new Simulation(1900, 900, new ShaderLayer({fragSrc: `
precision highp float;
precision highp int;
varying highp vec2 uv;
uniform highp float utime;
void main() {
  int num_steps = 30;
  int actual_steps;
  float cx = sin(utime/1000.);
  float cy = cos(utime/1100.);
  
  vec2 z = vec2((uv.x - 950.)/100., (uv.y - 450.)/100.);
  for (int i = 0; i < 1000; i++) {
    if (i == num_steps || z.x * z.x + z.y * z.y > 4.0) {
      actual_steps = i;
      break; 
    }
    z = vec2(z.x * z.x - z.y * z.y + cx,
            2. * z.x * z.y + cy);
  }
  if (actual_steps == num_steps) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    float cval = float(actual_steps)/float(num_steps);
    gl_FragColor = vec4(cval*cval, cval*cval, cval, 1.0);
  }
}`})).resume()