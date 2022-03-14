import{o as _,c as m,a as i,r as h,u as P,b as $,d as l,e as R,f as N,i as j,w as z,g as F,n as y,t as B,F as D,h as O,v as U,j as C,k as E,_ as I,l as W,m as Y,p as T,q as Z,s as b,x as q,y as J,z as G,A as K,B as Q,C as X,D as ee,E as te,G as f,H as M,I as se,J as V,K as A,L as H,M as oe,N as ne,O as ae,P as le,Q as ie,R as re,S as w,T as ce,U as ue,V as de,W as pe,X as fe,Y as _e,Z as ve,$ as me,a0 as he}from"./vendor.98d893ac.js";import ge from"./DrawingControls.8383990e.js";const xe={class:"slidev-icon",width:"1.2em",height:"1.2em",preserveAspectRatio:"xMidYMid meet",viewBox:"0 0 32 32"},ye=i("path",{fill:"currentColor",d:"M12 10H6.78A11 11 0 0 1 27 16h2A13 13 0 0 0 6 7.68V4H4v8h8zm8 12h5.22A11 11 0 0 1 5 16H3a13 13 0 0 0 23 8.32V28h2v-8h-8z"},null,-1),we=[ye];function ke(t,o){return _(),m("svg",xe,we)}var $e={name:"carbon-renew",render:ke};const Se={class:"slidev-icon",width:"1.2em",height:"1.2em",preserveAspectRatio:"xMidYMid meet",viewBox:"0 0 32 32"},Ce=i("path",{fill:"currentColor",d:"M16 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14Zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4Z"},null,-1),Te=i("path",{fill:"currentColor",d:"M20.59 22L15 16.41V7h2v8.58l5 5.01L20.59 22z"},null,-1),be=[Ce,Te];function Me(t,o){return _(),m("svg",Se,be)}var Ve={name:"carbon-time",render:Me},Ae="/solve/assets/logo-title-horizontal.96c3c915.png";function He(){const t=h(Date.now()),o=P({interval:1e3}),r=$(()=>{const n=(o.value-t.value)/1e3,a=Math.floor(n%60).toString().padStart(2,"0");return`${Math.floor(n/60).toString().padStart(2,"0")}:${a}`});function c(){t.value=o.value}return{timer:r,resetTimer:c}}function Ne(t){if(t==null)return{info:h(),update:async()=>{}};const o=`/@slidev/slide/${t}.json`,{data:r,execute:c}=R(o).json().get();c();const n=async a=>await fetch(o,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(a)}).then(p=>p.json());return(!1).on("slidev-update",a=>{a.id===t&&(r.value=a.data)}),{info:r,update:n}}const k={};function ze(t){function o(r){const c=`${r}`;return k[c]||(k[c]=Ne(r)),k[c]}return{info:$(()=>o(l(t)).info.value),update:async(r,c)=>{const n=o(c!=null?c:l(t)),a=await n.update(r);return a&&(n.info.value=a),a}}}const Be=["innerHTML"],De=["textContent"],Le=["placeholder"],Pe=N({props:{class:{default:""},placeholder:{default:"No notes for this slide"}},setup(t){const o=t,{info:r,update:c}=ze(C),n=h("");let a;const{ignoreUpdates:p}=j(n,s=>{const e=C.value;clearTimeout(a),a=setTimeout(()=>{c({raw:null,note:s},e)},500)});z(r,s=>{clearTimeout(a),p(()=>{n.value=(s==null?void 0:s.note)||""})},{immediate:!0,flush:"sync"});const v=h(),u=h(!1);async function g(s){var e,d,x;((e=s==null?void 0:s.target)==null?void 0:e.tagName)!=="A"&&(u.value=!0,(d=v.value)==null||d.focus(),await E(),(x=v.value)==null||x.focus())}return F(v,()=>{u.value=!1}),(s,e)=>{var d,x;return!u.value&&n.value?(_(),m(D,{key:0},[(d=l(r))!=null&&d.notesHTML?(_(),m("div",{key:0,class:y(["prose overflow-auto outline-none",o.class]),onClick:g,innerHTML:(x=l(r))==null?void 0:x.notesHTML},null,10,Be)):(_(),m("div",{key:1,class:y(["prose overflow-auto outline-none",o.class]),onClick:g,textContent:B(n.value)},null,10,De))],2112)):O((_(),m("textarea",{key:1,ref_key:"input",ref:v,"onUpdate:modelValue":e[0]||(e[0]=S=>n.value=S),class:y(["prose resize-none overflow-auto outline-none bg-transparent block",o.class]),placeholder:t.placeholder,onFocus:e[1]||(e[1]=S=>u.value=!0)},null,42,Le)),[[U,n.value]])}}});const L=t=>(ue("data-v-29f50a9c"),t=t(),de(),t),Re={class:"bg-main h-full slidev-presenter"},je={class:"grid-container"},Fe={class:"grid-section top flex"},Oe=L(()=>i("img",{src:Ae,class:"h-14 ml-2 py-2 my-auto"},null,-1)),Ue=L(()=>i("div",{class:"flex-auto"},null,-1)),Ee={class:"text-2xl pl-2 pr-6 my-auto"},Ie={class:"grid-section next flex flex-col p-4"},We={class:"grid-section note overflow-auto"},Ye={class:"grid-section bottom"},Ze={class:"progress-bar"},qe=N({setup(t){const o=h();W(),Y(o);const r=T.titleTemplate.replace("%s",T.title||"Slidev");Z({title:`Presenter - ${r}`});const{timer:c,resetTimer:n}=He(),a=h([]),p=$(()=>b.value<q.value?{route:J.value,clicks:b.value+1}:G.value?{route:K.value,clicks:0}:null);return Q(()=>{const v=o.value.querySelector("#slide-content"),u=X(ee()),g=te();z(()=>{if(!g.value||me.value||!he.value)return;const s=v.getBoundingClientRect(),e=(u.x-s.left)/s.width*100,d=(u.y-s.top)/s.height*100;if(!(e<0||e>100||d<0||d>100))return{x:e,y:d}},s=>{ve.cursor=s})}),(v,u)=>{const g=Ve,s=$e;return _(),m(D,null,[i("div",Re,[i("div",je,[i("div",Fe,[Oe,Ue,i("div",{class:"timer-btn my-auto relative w-22px h-22px cursor-pointer text-lg",opacity:"50 hover:100",onClick:u[0]||(u[0]=(...e)=>l(n)&&l(n)(...e))},[f(g,{class:"absolute"}),f(s,{class:"absolute opacity-0"})]),i("div",Ee,B(l(c)),1)]),i("div",{ref_key:"main",ref:o,class:"grid-section main flex flex-col p-4",style:M(l(se))},[f(V,{key:"main",class:"h-full w-full"},{default:A(()=>[f(pe)]),_:1})],4),i("div",Ie,[l(p)?(_(),H(V,{key:"next",class:"h-full w-full"},{default:A(()=>{var e;return[f(l(fe),{is:(e=l(p).route)==null?void 0:e.component,"clicks-elements":a.value,"onUpdate:clicks-elements":u[1]||(u[1]=d=>a.value=d),clicks:l(p).clicks,"clicks-disabled":!1,class:y(l(_e)(l(p).route))},null,8,["is","clicks-elements","clicks","class"])]}),_:1})):oe("v-if",!0)]),i("div",We,[f(Pe,{class:"w-full h-full p-4 overflow-auto"})]),i("div",Ye,[f(ne,{persist:!0})]),(_(),H(ge,{key:0}))]),i("div",Ze,[i("div",{class:"progress h-2px bg-primary transition-all",style:M({width:`${(l(ae)-1)/(l(le)-1)*100}%`})},null,4)])]),f(ie),f(re,{modelValue:l(w),"onUpdate:modelValue":u[2]||(u[2]=e=>ce(w)?w.value=e:null)},null,8,["modelValue"])],64)}}});var Ke=I(qe,[["__scopeId","data-v-29f50a9c"]]);export{Ke as default};
