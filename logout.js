import {reply,isSameOrigin,clearCookie} from "./_auth.js";
export async function onRequestPost({request}){if(!isSameOrigin(request))return reply({error:"Invalid request origin"},403);return reply({ok:true},200,{"set-cookie":clearCookie});}
