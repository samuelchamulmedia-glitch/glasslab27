import { displacementGLSL } from './maps';
import type {Settings} from './presets';
const vertex=`#version 300 es
in vec2 position;out vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0,1);}`;
const fragment=`#version 300 es
precision highp float;
in vec2 uv;out vec4 color;
uniform sampler2D uSource,uMap;uniform vec2 uSize,uAxis,uOffset,uCenter;
uniform float uStrength,uSpacing,uRotation,uBlur,uDetail,uChroma,uBlend,uSeed,uCurvature;
uniform int uPreset;
${displacementGLSL}
vec4 samplePM(vec2 p){ if(any(lessThan(p,vec2(0)))||any(greaterThan(p,vec2(1))))return vec4(0);return texture(uSource,p); }
vec4 soft(vec2 p){vec4 sum=samplePM(p)*4.;sum+=samplePM(p+vec2(uBlur,0)/uSize);sum+=samplePM(p-vec2(uBlur,0)/uSize);sum+=samplePM(p+vec2(0,uBlur)/uSize);sum+=samplePM(p-vec2(0,uBlur)/uSize);sum+=samplePM(p+vec2(uBlur)/uSize);sum+=samplePM(p-vec2(uBlur)/uSize);sum+=samplePM(p+vec2(uBlur,-uBlur)/uSize);sum+=samplePM(p+vec2(-uBlur,uBlur)/uSize);return sum/12.;}
void main(){vec2 p=vec2(uv.x,1.-uv.y);vec2 d=field(p);vec4 c=soft(p+d);if(uChroma>0.){vec2 shift=vec2(uChroma,0)/uSize;vec4 r=soft(p+d+shift),b=soft(p+d-shift);c.r=r.a>0.?r.r/r.a*c.a:0.;c.b=b.a>0.?b.b/b.a*c.a:0.;}if(uPreset==2)c.rgb=clamp(c.rgb+(hash(floor(p*uSize))-.5)*uDetail*.09*c.a,vec3(0),vec3(c.a));c=mix(samplePM(p),c,uBlend);color=c.a>0.?vec4(c.rgb/c.a,c.a):vec4(0);}
`;
export class Renderer {
 gl:WebGL2RenderingContext;program:WebGLProgram;source:WebGLTexture;map:WebGLTexture;limit:number;
 constructor(public canvas:HTMLCanvasElement){
 const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL2 is required. Enable hardware acceleration or try another browser.');this.gl=gl;
 this.limit=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
 const compile=(type:number,code:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader compilation failed');return s;};
 this.program=gl.createProgram()!;const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program)||'Shader link failed');gl.useProgram(this.program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(this.program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 this.source=gl.createTexture()!;this.map=gl.createTexture()!;gl.uniform1i(gl.getUniformLocation(this.program,'uSource'),0);gl.uniform1i(gl.getUniformLocation(this.program,'uMap'),1);
 }
 upload(image:TexImageSource,map=false){const gl=this.gl;gl.activeTexture(map?gl.TEXTURE1:gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,map?this.map:this.source);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!map);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);if(gl.getError()!==gl.NO_ERROR)throw Error('The GPU could not allocate this image. Try a smaller source.');}
 render(s:Settings,width:number,height:number,outWidth:number,outHeight:number){if(this.gl.isContextLost())throw Error('GPU context lost. Reload the app to restore rendering.');if(Math.max(width,height,outWidth,outHeight)>this.limit)throw Error(`This GPU supports dimensions up to ${this.limit}px. Export was not reduced.`);this.canvas.width=outWidth;this.canvas.height=outHeight;const gl=this.gl;gl.viewport(0,0,outWidth,outHeight);gl.useProgram(this.program);const f=(n:string,v:number)=>gl.uniform1f(gl.getUniformLocation(this.program,n),v);const v=(n:string,x:number,y:number)=>gl.uniform2f(gl.getUniformLocation(this.program,n),x,y);v('uSize',width,height);v('uAxis',s.x/100,s.y/100);v('uOffset',s.offsetX,s.offsetY);v('uCenter',s.centerX/100,s.centerY/100);gl.uniform1i(gl.getUniformLocation(this.program,'uPreset'),s.preset);for(const [name,val] of Object.entries({Strength:s.strength,Spacing:s.spacing,Rotation:s.rotation,Blur:s.blur,Detail:s.detail/100,Chroma:s.chroma,Blend:s.blend/100,Seed:s.seed,Curvature:s.curvature/100}))f('u'+name,val);gl.drawArrays(gl.TRIANGLES,0,6);if(gl.getError()!==gl.NO_ERROR)throw Error('GPU rendering failed; no export was produced.');}
}

