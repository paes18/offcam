import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.dirname(fileURLToPath(import.meta.url));
const node=process.execPath;
const apiPort=Number(process.env.API_PORT)||3917;
const preferredPort=Number(process.env.DEV_PORT)||5181;
function available(port){return new Promise(resolve=>{const probe=createServer();probe.once('error',()=>resolve(false));probe.listen(port,'0.0.0.0',()=>probe.close(()=>resolve(true)))})}
let webPort=preferredPort;
while(!(await available(webPort))){webPort+=1;if(webPort>5279)throw new Error('Tidak ada port dev yang tersedia. Tutup instance SELA lain lalu coba lagi.')}
const children=[];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)if(!child.killed)child.kill('SIGTERM');setTimeout(()=>process.exit(code),150)}
children.push(spawn(node,['--experimental-sqlite',path.join(root,'server/index.js')],{cwd:root,stdio:'inherit',env:{...process.env,PORT:String(apiPort)}}));
children.push(spawn(node,[path.join(root,'node_modules/vite/bin/vite.js'),'--host','0.0.0.0','--port',String(webPort),'--strictPort','--config','vite.config.js'],{cwd:root,stdio:'inherit',env:{...process.env,API_PORT:String(apiPort)}}));
children.forEach((child,index)=>{child.on('error',error=>{console.error(error);stop(1)});child.on('exit',(code,signal)=>{if(index===0&&code===0&&signal===null)return;if(!stopping){console.error(`${index===0?'Backend':'Vite'} berhenti (${signal||code}).`);stop(code||1)}})});
process.on('SIGINT',()=>stop(0));process.on('SIGTERM',()=>stop(0));
