const enc = new TextEncoder();
function b64url(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
function fromB64url(s){s=s.replace(/-/g,"+").replace(/_/g,"/");const b=atob(s+"=".repeat((4-s.length%4)%4));return Uint8Array.from(b,c=>c.charCodeAt(0));}
async function sign(value,secret){const k=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64url(new Uint8Array(await crypto.subtle.sign("HMAC",k,enc.encode(value))));}
export function reply(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});}
export function isSameOrigin(req){const origin=req.headers.get("Origin");return !origin||origin===new URL(req.url).origin;}
export async function createSession(secret,username){const p=b64url(enc.encode(JSON.stringify({u:username,exp:Date.now()+8*60*60*1000})));return p+"."+await sign(p,secret);}
export async function requireAdmin(req,env){if(!env.SESSION_SECRET)return false;const c=req.headers.get("Cookie")||"",item=c.split(";").map(x=>x.trim()).find(x=>x.startsWith("appnook_session="));if(!item)return false;const token=item.slice("appnook_session=".length),i=token.lastIndexOf(".");if(i<1)return false;const p=token.slice(0,i),sig=token.slice(i+1),expected=await sign(p,env.SESSION_SECRET);if(sig.length!==expected.length)return false;let n=0;for(let j=0;j<sig.length;j++)n|=sig.charCodeAt(j)^expected.charCodeAt(j);if(n)return false;try{const d=JSON.parse(new TextDecoder().decode(fromB64url(p)));return d.u===(env.ADMIN_USERNAME||"admin")&&d.exp>Date.now();}catch{return false;}}
export const sessionCookie=t=>"appnook_session="+t+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800";
export const clearCookie="appnook_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
