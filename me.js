import {reply,requireAdmin} from "./_auth.js";
export async function onRequestGet({request,env}){if(!await requireAdmin(request,env))return reply({error:"Unauthorized"},401);return reply({ok:true,username:env.ADMIN_USERNAME||"admin"});}
