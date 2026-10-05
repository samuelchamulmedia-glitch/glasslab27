import {Renderer} from './renderer';
import type {Settings} from './presets';
export async function exportPNG(renderer:Renderer,s:Settings,width:number,height:number,name:string){renderer.render(s,width,height,width,height);const blob=await new Promise<Blob>((resolve,reject)=>renderer.canvas.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed.')),'image/png'));const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name.replace(/\.[^.]+$/,'')+'-glass.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
