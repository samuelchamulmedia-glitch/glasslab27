export const presets = [
 {name:'Fluted',description:'Sculptural, parallel ridges',icon:'▥'},
 {name:'Reeded',description:'Soft, rounded ribbing',icon:'▤'},
 {name:'Frosted',description:'A finely textured haze',icon:'░'},
 {name:'Wavy',description:'Fluid, rolling refraction',icon:'≈'},
 {name:'Ripple',description:'Concentric waves of light',icon:'◎'},
 {name:'Prismatic',description:'Angular, crystalline facets',icon:'◇'},
 {name:'Organic',description:'Irregular flowing surfaces',icon:'♧'},
 {name:'Custom map',description:'Your own displacement field',icon:'▧'}
];
export type Settings = {preset:number;strength:number;x:number;y:number;spacing:number;rotation:number;offsetX:number;offsetY:number;blur:number;detail:number;chroma:number;blend:number;seed:number;curvature:number;centerX:number;centerY:number};
export const defaults:Settings = {preset:0,strength:24,x:100,y:35,spacing:64,rotation:0,offsetX:0,offsetY:0,blur:0,detail:15,chroma:0,blend:100,seed:42,curvature:50,centerX:50,centerY:50};
export function presetSettings(preset:number):Settings {return {...defaults,preset,blur:preset===2?2:0,strength:preset===2?8:preset===5?32:24,chroma:preset===5?2:0};}
