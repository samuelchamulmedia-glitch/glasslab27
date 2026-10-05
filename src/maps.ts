// All procedural patterns are deterministic and evaluated in source-image pixels.
export const displacementGLSL = `
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7))+uSeed*0.731)*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y); }
vec2 field(vec2 uv){
 float a=radians(uRotation); mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));
 vec2 p=rot*(uv*uSize+uOffset)/uSpacing; vec2 d;
 if(uPreset==0) { float t=fract(p.x); d=vec2(mix(2.*t-1.,sin(t*6.283185),uCurvature),0.15*sin(p.x*6.283185)); }
 else if(uPreset==1) d=vec2(sin(p.x*6.283185),0.08*cos(p.x*6.283185));
 else if(uPreset==2) d=vec2(noise(p*12.)-.5,noise(p*12.+37.)-.5)*2.;
 else if(uPreset==3) d=vec2(sin(p.y*3.+sin(p.x)),cos(p.x*2.+sin(p.y)));
 else if(uPreset==4){vec2 q=(uv-uCenter)*uSize;float r=length(q);d=q/max(r,1.)*sin(r/uSpacing*6.283185);}
 else if(uPreset==5){ vec2 cell=floor(p);d=vec2(hash(cell),hash(cell+93.))*2.-1.; }
 else if(uPreset==6) d=vec2(noise(p)-.5,noise(p+17.)-.5)*3.;
 else {vec2 m=texture(uMap,fract(p*64./uSize)).rg;d=(m*2.-1.);}
 d+=uDetail*.2*vec2(noise(p*8.)-.5,noise(p*8.+21.)-.5);
 return transpose(rot)*d*uStrength*uAxis/uSize;
}
`;

