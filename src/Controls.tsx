import type {Settings} from './presets';
import {defaults} from './presets';
export function EffectControl({settings,update,id,label,min,max,unit='',step=1}:{settings:Settings;update:(patch:Partial<Settings>)=>void;id:keyof Settings;label:string;min:number;max:number;unit?:string;step?:number}){
 return <label className="control"><span>{label}<span className="value"><input aria-label={label+' value'} type="number" value={settings[id]} min={min} max={max} step={step} onChange={e=>{const n=e.target.valueAsNumber;if(Number.isFinite(n))update({[id]:Math.max(min,Math.min(max,n))});}}/>{unit}</span></span><input aria-label={label} type="range" min={min} max={max} step={step} value={settings[id]} onDoubleClick={()=>update({[id]:defaults[id]})} onChange={e=>update({[id]:+e.target.value})}/></label>;
}
