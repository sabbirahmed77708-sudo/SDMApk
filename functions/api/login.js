import {reply,isSameOrigin,createSession,sessionCookie} from "./_auth.js";
export async function onRequestPost({request,env}){
 if(!isSameOrigin(request))return reply({error:"Invalid request origin"},403);
 if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return reply({error:"Admin secrets are not configured"},503);
 let b;try{b=await request.json();}catch{return reply({error:"Invalid JSON"},400);}
 const expectedUser=env.ADMIN_USERNAME||"admin",user=String(b.username||""),pass=String(b.password||"");
 const digest=async s=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
 const [u1,u2,p1,p2]=await Promise.all([digest(user),digest(expectedUser),digest(pass),digest(env.ADMIN_PASSWORD)]);
 const eq=(a,c)=>{let n=0;for(let i=0;i<a.length;i++)n|=a[i]^c[i];return n===0;};
 if(!eq(u1,u2)||!eq(p1,p2))return reply({error:"Username or password is incorrect"},401);
 return reply({ok:true},200,{"set-cookie":sessionCookie(await createSession(env.SESSION_SECRET,expectedUser))});
}
