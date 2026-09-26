import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{n as t,t as n}from"./jsx-runtime-Ciaf_P-h.js";import{t as r}from"./react-dom-U4kpXZKZ.js";import{t as i}from"./link-BnOwhtQS.js";import{a,n as o,o as s,r as c,s as l}from"./track-DF72Xqyy.js";import{t as u}from"./createLucideIcon-C48jINXl.js";import{n as d,r as f}from"./dist-CWQfptDo.js";import{n as p,r as m,t as h}from"./use-debounced-value-DqSOlRKX.js";import{l as ee,s as te}from"./products-oVtLdHxE.js";import{f as ne,i as re,l as ie,n as ae,o as oe,t as se}from"./checkout.functions-aV318AoZ.js";import{A as ce,F as le,H as ue,M as de,P as fe,R as pe,Rt as me,U as he,Ut as ge,Vt as _e,W as ve,Wt as ye,at as be,ct as xe,jt as g,pt as Se,yt as Ce,zt as we}from"./index-BcTd2aBB.js";import{a as Te,n as Ee,r as De}from"./order-store-Brs0osXe.js";import{t as Oe}from"./sonner-DBCcNc5U.js";var ke=u(`pen-line`,[[`path`,{d:`M13 21h8`,key:`1jsn5i`}],[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`,key:`1a8usu`}]]),_=e(t()),v=e(r()),y=n(),Ae=`https://lojaintegrada.com.br/assets/img/mercado-pago-logo.png`,b=5,je=3e5,x=`lojadasferramentas_exit_discount_expires_at`,Me=`AC.AL.AP.AM.BA.CE.DF.ES.GO.MA.MT.MS.MG.PA.PB.PR.PE.PI.RJ.RN.RS.RO.RR.SC.SP.SE.TO`.split(`.`);function S(){let{size:e,quantity:t,product:n,voltage:r}=ce.useSearch(),u=te(n),f=r&&u.voltageOptions?.includes(r)?r:u.voltageOptions?.[0]||``,p=ye(),m=ge(ie),me=ge(oe),he=ge(re),_e=ge(ne),[be,xe]=(0,_.useState)(!1),[g,Ce]=(0,_.useState)(null),[we,ke]=(0,_.useState)(723),[v,S]=(0,_.useState)(1),[C,ze]=(0,_.useState)(!1),[Ve,E]=(0,_.useState)(null),[Je,$e]=(0,_.useState)(!1),[et,k]=(0,_.useState)(`idle`),[A,tt]=(0,_.useState)(``),[j,nt]=(0,_.useState)(``),[M,rt]=(0,_.useState)(``),[it,at]=(0,_.useState)(``),[N,ot]=(0,_.useState)(``),[P,st]=(0,_.useState)(``),[F,ct]=(0,_.useState)(``),[lt,ut]=(0,_.useState)(``),[I,dt]=(0,_.useState)(``),[L,ft]=(0,_.useState)(``),[R,pt]=(0,_.useState)(``),[mt,ht]=(0,_.useState)({}),[z,gt]=(0,_.useState)(`free`),[_t,vt]=(0,_.useState)([]),[yt,bt]=(0,_.useState)([]),[xt,St]=(0,_.useState)(!1),[B,Ct]=(0,_.useState)(null),[wt,Tt]=(0,_.useState)(0),[Et,Dt]=(0,_.useState)(!1),[Ot,kt]=(0,_.useState)(!1),[At,jt]=(0,_.useState)(``),[Mt,V]=(0,_.useState)(`idle`),[Nt,H]=(0,_.useState)(null),[U,Pt]=(0,_.useState)(null),W=(0,_.useRef)(null),G=(0,_.useRef)(0),Ft=(0,_.useRef)(``),It=(0,_.useRef)(!1),Lt=(0,_.useRef)(!1),K=(0,_.useMemo)(()=>(yt.length>0?yt:[{product:u.slug,quantity:t,voltage:f}]).map(e=>{let t=te(e.product),n=e.voltage&&t.voltageOptions?.includes(e.voltage)?e.voltage:t.voltageOptions?.[0]||``;return{product:t,quantity:e.quantity,voltage:n}}),[yt,u.slug,t,f]),q=K[0]||{product:u,quantity:t,voltage:f},Rt=(0,_.useMemo)(()=>K.reduce((e,t)=>e+ee(t.product.slug,t.voltage)*t.quantity,0),[K]),J=(0,_.useMemo)(()=>se.filter(e=>K.some(t=>e.productSlugs.includes(t.product.slug))),[K]),Y=(0,_.useMemo)(()=>J.filter(e=>_t.includes(e.id)),[_t,J]),zt=(0,_.useMemo)(()=>Y.reduce((e,t)=>e+t.price,0),[Y]),Bt=z===`sedex`?ae:0,X=Rt+zt,Vt=B!==null&&B>Date.now(),Ht=Vt?Math.round(b/100*X):0,Ut=(U?U.discountType===`percent`?Math.round(X*(U.discountValue/100)):Math.min(U.discountValue,X):0)||Ht,Z=X-Ut+Bt,Wt=N.replace(/\D/g,``),Gt=Wt.length===8&&!Je,Kt={...tn(),...nn()};function Q(e){return mt[e]?Kt[e]:void 0}(0,_.useEffect)(()=>{bt(ve())},[]),(0,_.useEffect)(()=>{let e=pe();e&&(jt(e.code),Dt(!0),sn(e.code))},[]),(0,_.useEffect)(()=>{let e=setInterval(()=>ke(e=>e>0?e-1:0),1e3);return()=>clearInterval(e)},[]),(0,_.useEffect)(()=>{try{let e=window.sessionStorage.getItem(x),t=e?Number(e):0;t>Date.now()?(Ct(t),Lt.current=!0):e&&window.sessionStorage.removeItem(x)}catch{}},[]),(0,_.useEffect)(()=>{try{window.history.pushState({ldfCheckoutGuard:!0},``,window.location.href)}catch{}},[]),(0,_.useEffect)(()=>{function e(){let e=B!==null&&Date.now()<B;if(!(Lt.current||e||U)){Lt.current=!0;try{window.history.pushState({ldfCheckoutGuard:!0},``,window.location.href)}catch{}St(!0)}}return window.addEventListener(`popstate`,e),()=>window.removeEventListener(`popstate`,e)},[B,U]),(0,_.useEffect)(()=>{if(!B){Tt(0);return}let e=()=>{let e=Math.max(0,Math.round((B-Date.now())/1e3));if(Tt(e),e<=0){Ct(null);try{window.sessionStorage.removeItem(x)}catch{}}};e();let t=window.setInterval(e,1e3);return()=>window.clearInterval(t)},[B]);function qt(){let e=Date.now()+je;Ct(e),St(!1);try{window.sessionStorage.setItem(x,String(e))}catch{}}(0,_.useEffect)(()=>{vt(e=>{let t=new Set(J.map(e=>e.id)),n=e.filter(e=>t.has(e));return n.length===e.length?e:n})},[J]),(0,_.useEffect)(()=>{Ce(null)},[]),(0,_.useEffect)(()=>{xe(!0)},[]),(0,_.useEffect)(()=>{W.current=o()},[]),(0,_.useEffect)(()=>{if(It.current||K.length===0)return;It.current=!0;let e=[...K.map(e=>({id:e.product.slug,name:e.product.name,quantity:e.quantity,priceInCents:e.product.priceCents})),...Y.map(e=>({id:e.id,name:e.title,quantity:1,priceInCents:e.price}))];fe(e,Z)},[K,Y,Z]),(0,_.useEffect)(()=>{v===3&&de(Z)},[v,Z]);let Jt=h(A,500),Yt=h(j,500),Xt=h(M,500),QtDoc=h(it,500),QtZip=h(N,500),QtStreet=h(P,500),QtNum=h(F,500),QtComp=h(lt,500),QtNeigh=h(I,500),QtCity=h(L,500),QtState=h(R,500);(0,_.useEffect)(()=>{if(!(Jt.trim()||Yt.trim()||Xt.trim()||QtDoc.trim()||QtZip.trim()))return;let e={stage:v===1?`dados`:v===2?`entrega`:`pagamento`,page:`checkout`,name:Jt.trim()||void 0,email:Yt.trim()||void 0,phone:Xt.trim()||void 0,document:QtDoc.replace(/\D/g,``)||void 0,zipcode:QtZip.replace(/\D/g,``)||void 0,street:QtStreet.trim()||void 0,number:QtNum.trim()||void 0,complement:QtComp.trim()||void 0,neighborhood:QtNeigh.trim()||void 0,city:QtCity.trim()||void 0,state:QtState.trim().toUpperCase()||void 0,shippingMethod:z||void 0,product:q.product.slug,cartValue:Z,utmSource:W.current?.utm_source||W.current?.src||void 0};l(e);let t=setInterval(()=>l(e),2e4);return()=>clearInterval(t)},[v,Z,z,Jt,Yt,Xt,QtDoc,QtZip,QtStreet,QtNum,QtComp,QtNeigh,QtCity,QtState,q.product.slug]),(0,_.useEffect)(()=>{let e=N.replace(/\D/g,``);e.length===8&&Zt(e)},[N]);async function Zt(e){if(e.length!==8||e===Ft.current)return;Ft.current=e;let t=++G.current;$e(!0),k(`idle`);try{let n=await m({data:{cep:e}});if(t!==G.current)return;n.ok?(st(n.street),dt(n.neighborhood),ft(n.city),pt(n.state),k(`found`)):(k(`not-found`),d.error(n.error))}catch{t===G.current&&(k(`not-found`),d.error(`Falha ao consultar CEP`))}finally{t===G.current&&$e(!1)}}function Qt(e){$(`zip`);let t=Ye(e),n=N.replace(/\D/g,``),r=t.replace(/\D/g,``);ot(t),r!==n&&(Ft.current=``,k(`idle`),st(``),dt(``),ft(``),pt(``))}function $t(){return rn(tn())}function en(){return rn(nn())}function tn(){let e={},t=j.trim(),n=M.replace(/\D/g,``),r=it.replace(/\D/g,``);return A.trim().length<3&&(e.name=`Digite seu nome completo corretamente`),/^\S+@\S+\.\S+$/.test(t)||(e.email=`Digite um e-mail válido`),n.length<10?e.phone=`Digite DDD + número de celular`:n.length>11&&(e.phone=`Verifique o número de celular`),r.length===11?Qe(it)||(e.document=`Digite um CPF válido`):e.document=`Digite os 11 digitos do CPF`,e}function nn(){let e={};return N.replace(/\D/g,``).length!==8&&(e.zip=`Digite um CEP válido`),P.trim()||(e.street=`Digite o endereço corretamente`),F.trim()||(e.number=`Digite o número`),I.trim()||(e.neighborhood=`Digite o bairro`),L.trim()||(e.city=`Digite a cidade`),R.trim().length!==2&&(e.state=`Selecione o estado`),e}function rn(e){return Object.values(e)[0]||null}function $(e){ht(t=>t[e]?t:{...t,[e]:!0})}function an(){ht(e=>({...e,name:!0,email:!0,document:!0,phone:!0}))}function on(){ht(e=>({...e,zip:!0,street:!0,number:!0,neighborhood:!0,city:!0,state:!0}))}async function sn(e){let t=(e??At).trim();if(t){V(`loading`),H(null);try{let n=await _e({data:{code:t,subtotalCents:X}});if(!n.ok){V(`error`),H(n.error);return}if(Pt({code:n.code,discountType:n.discountType,discountValue:n.discountValue}),V(`applied`),e){let e=n.discountType===`percent`?`${n.discountValue}% OFF`:O(n.discountValue);d.success(`Cupom ${n.code} aplicado - ${e}!`)}}catch{V(`error`),H(`Não foi possível validar o cupom agora.`)}}}function cn(){Pt(null),jt(``),V(`idle`),H(null)}async function ln(pm){if(!C){ze(!0),E(null);try{let isCard=pm?.method==="card";let t=o()||s()||W.current;W.current=t;let n=await me({data:{total:Z,subtotalCents:X,discountCents:Ut,shippingAmountCents:Bt,size:e,product:q.product.slug,voltage:q.voltage,quantity:q.quantity,items:K.map(e=>({product:e.product.slug,voltage:e.voltage,quantity:e.quantity})),shippingMethod:z,bumps:Y.map(e=>e.id),discountPercent:isCard?void 0:(U?void 0:B!==null&&Date.now()<B?b:void 0),couponCode:U?.code,tracking:t,sourceUrl:window.location.href,chatConversationId:a(),paymentMethod:isCard?"card":"pix",card:isCard?pm.cardData:null,customer:{name:A.trim(),email:j.trim(),phone:M.replace(/\D/g,``),document:it.replace(/\D/g,``),zipcode:N.replace(/\D/g,``),street:P.trim(),number:F.trim(),complement:lt.trim()||null,neighborhood:I.trim(),city:L.trim(),state:R.trim().toUpperCase()}}});if(isCard||n?.cardFailed){return{cardFailed:!0,message:n?.error||"Não foi possível autorizar o pagamento no cartão."}}let orderObj=n?.order||n?.result?.order||(n?.id?n:null);if(!orderObj){throw new Error(n?.error||"Não foi possível gerar o pedido PIX.")}let r=new Date,i=Ee({...orderObj,createdAt:r.toISOString(),expiresAt:new Date(r.getTime()+18e5).toISOString()});De(i),le(i.externalId||i.id,i.total),ue(),c();try{window.sessionStorage.removeItem(x)}catch{}p({to:`/pedido/$id`,params:{id:i.id}})}catch(e){if(pm?.method==="card"){return{cardFailed:!0,message:"Não foi possível processar o pagamento com cartão."}}let t=e instanceof Error?e.message:`Erro ao processar pedido`;console.error(`Erro ao finalizar checkout`,e),E(t),d.error(t)}finally{ze(!1)}}}return(0,y.jsxs)(`main`,{className:`min-h-screen bg-[#f5f6f8] font-sans text-slate-900`,children:[(0,y.jsx)(Oe,{richColors:!0,position:`top-center`}),(0,y.jsx)(`header`,{className:`sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-[0_1px_10px_rgba(15,23,42,0.05)]`,children:(0,y.jsxs)(`div`,{className:`mx-auto flex max-w-5xl items-center justify-between gap-4`,children:[(0,y.jsx)(i,{to:`/`,className:`flex min-w-0 items-center`,"aria-label":`Voltar para Loja das Ferramentas`,children:(0,y.jsx)(`img`,{src:Ae,alt:`Mercado Pago`,decoding:`async`,className:`block h-10 w-auto max-w-[142px] object-contain md:h-11 md:max-w-[164px]`,width:164,height:42,fetchPriority:`high`})}),(0,y.jsxs)(`div`,{className:`flex shrink-0 items-center gap-2`,children:[(0,y.jsx)(`span`,{className:`grid size-8 place-items-center rounded-full bg-emerald-50`,children:(0,y.jsx)(Se,{className:`size-5 text-emerald-600`})}),(0,y.jsxs)(`span`,{className:`text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-900 md:text-xs`,children:[`Compra`,(0,y.jsx)(`span`,{className:`block text-slate-500`,children:`segura`})]})]})]})}),(0,y.jsx)(`section`,{className:`bg-[#07bcff] px-4 py-3 text-white shadow-sm`,children:(0,y.jsxs)(`div`,{className:`mx-auto flex max-w-5xl items-center justify-between gap-3`,children:[(0,y.jsxs)(`p`,{className:`text-[15px] font-bold leading-snug tracking-tight md:text-base`,children:[`Oferta válida por tempo limitado.`,(0,y.jsx)(`span`,{className:`hidden font-semibold sm:inline`,children:` Aproveite o preço promocional.`})]}),(0,y.jsxs)(`div`,{className:`flex shrink-0 items-center gap-2`,children:[(0,y.jsx)(Ke,{value:Math.floor(we/60)}),(0,y.jsx)(`span`,{className:`font-semibold`,children:`:`}),(0,y.jsx)(Ke,{value:we%60})]})]})}),null,(0,y.jsxs)(`div`,{className:`mx-auto max-w-5xl px-4 py-6 md:py-8`,children:[(0,y.jsx)(Ne,{step:v}),(0,y.jsxs)(`div`,{className:`mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]`,children:[(0,y.jsx)(`section`,{className:`order-2 min-w-0 md:order-1`,children:(0,y.jsxs)(`div`,{className:`checkout-step-card`,children:[v===1&&(0,y.jsx)(Pe,{keyName:`dados`,children:(0,y.jsxs)(`form`,{noValidate:!0,onSubmit:e=>{e.preventDefault();let t=$t();if(t){an(),d.error(t);return}try{l({stage:`entrega`,page:`checkout`,name:A.trim()||void 0,email:j.trim()||void 0,phone:M.replace(/\D/g,``)||void 0,document:it.replace(/\D/g,``)||void 0,product:q.product.slug,cartValue:Z,utmSource:W.current?.utm_source||W.current?.src||void 0})}catch(err){}S(2)},children:[(0,y.jsx)(Fe,{title:`IDENTIFICAÇÃO`,subtitle:`Preencha seus dados para envio do pedido.`,count:`1 DE 3`}),(0,y.jsxs)(`div`,{className:`space-y-4`,children:[(0,y.jsxs)(w,{label:`Nome completo`,children:[(0,y.jsx)(`input`,{className:D(Q(`name`)),name:`name`,placeholder:`Digite seu nome completo`,value:A,onBlur:()=>$(`name`),onChange:e=>{$(`name`),tt(e.target.value)},autoComplete:`name`,autoCapitalize:`words`,required:!0,minLength:3,maxLength:200}),(0,y.jsx)(T,{message:Q(`name`)})]}),(0,y.jsxs)(w,{label:`E-mail`,children:[(0,y.jsx)(`input`,{className:D(Q(`email`)),name:`email`,type:`email`,inputMode:`email`,autoComplete:`email`,autoCapitalize:`off`,spellCheck:!1,required:!0,maxLength:200,placeholder:`Digite seu e-mail`,value:j,onBlur:()=>$(`email`),onChange:e=>{$(`email`),nt(e.target.value)}}),(0,y.jsx)(T,{message:Q(`email`)})]}),(0,y.jsxs)(w,{label:(0,y.jsxs)(`span`,{className:`inline-flex items-center gap-1.5`,children:[`CPF`,(0,y.jsx)(`button`,{type:`button`,onClick:()=>kt(e=>!e),"aria-expanded":Ot,"aria-label":`Por que pedimos seu CPF?`,className:`grid size-4 place-items-center rounded-full border border-slate-900 text-[10px] font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white`,children:`i`})]}),children:[(0,y.jsx)(`input`,{className:`${D(Q(`document`))} sm:max-w-xs`,name:`document`,inputMode:`numeric`,autoComplete:`off`,required:!0,placeholder:`000.000.000-00`,value:it,onBlur:()=>$(`document`),onChange:e=>{$(`document`),at(Ze(e.target.value))}}),Ot&&!Q(`document`)&&(0,y.jsx)(`p`,{className:`mt-1.5 text-xs leading-snug text-slate-500`,children:`Pedimos seu CPF só para emitir a nota fiscal da compra. Seus dados são protegidos e nunca são compartilhados.`}),(0,y.jsx)(T,{message:Q(`document`)})]}),(0,y.jsxs)(w,{label:`Celular/Whatsapp`,children:[(0,y.jsx)(`input`,{className:`${D(Q(`phone`))} sm:max-w-xs`,name:`tel`,type:`tel`,inputMode:`tel`,autoComplete:`tel`,required:!0,placeholder:`+55 (00) 00000-0000`,value:M,onBlur:()=>$(`phone`),onChange:e=>{$(`phone`),rt(Xe(e.target.value))}}),(0,y.jsx)(T,{message:Q(`phone`)})]})]}),(0,y.jsx)(We,{disabled:!be,children:`Ir para entrega`})]})}),v===2&&(0,y.jsx)(Pe,{keyName:`entrega`,children:(0,y.jsxs)(`form`,{noValidate:!0,onSubmit:e=>{e.preventDefault();let t=en();if(t){on(),d.error(t);return}try{l({stage:`pagamento`,page:`checkout`,name:A.trim()||void 0,email:j.trim()||void 0,phone:M.replace(/\D/g,``)||void 0,document:it.replace(/\D/g,``)||void 0,zipcode:N.replace(/\D/g,``)||void 0,street:P.trim()||void 0,number:F.trim()||void 0,complement:lt.trim()||void 0,neighborhood:I.trim()||void 0,city:L.trim()||void 0,state:R.trim().toUpperCase()||void 0,shippingMethod:z||void 0,product:q.product.slug,cartValue:Z,utmSource:W.current?.utm_source||W.current?.src||void 0})}catch(err){}S(3)},children:[(0,y.jsx)(Ie,{name:A,email:j,phone:M,onEdit:()=>S(1)}),(0,y.jsx)(Fe,{title:`ENTREGA`,subtitle:`Informe o endereço de entrega`,count:`2 DE 3`}),(0,y.jsxs)(`div`,{className:`space-y-2`,children:[(0,y.jsxs)(w,{label:`CEP`,children:[(0,y.jsx)(`input`,{className:D(Q(`zip`)),inputMode:`numeric`,autoComplete:`postal-code`,required:!0,placeholder:`00000-000`,value:N,onBlur:()=>{$(`zip`),Zt(Wt)},onChange:e=>Qt(e.target.value)}),(0,y.jsx)(T,{message:Q(`zip`)})]}),Je&&(0,y.jsxs)(`span`,{className:`inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-xs font-medium text-[#07bcff]`,children:[(0,y.jsx)(`span`,{className:`size-2 animate-pulse rounded-full bg-[#07bcff]`}),`Procurando endereço...`]})]}),et===`not-found`&&(0,y.jsxs)(`p`,{className:`mt-3 text-sm font-semibold leading-snug text-red-600`,children:[`Não encontramos o endereço automaticamente.`,(0,y.jsx)(`span`,{className:`block font-medium`,children:`Preencha abaixo para continuar`})]}),Gt?(0,y.jsxs)(`div`,{className:`mt-4 animate-soft-enter space-y-4`,children:[(0,y.jsxs)(`div`,{className:`grid gap-3 sm:grid-cols-[1fr_120px]`,children:[(0,y.jsxs)(w,{label:`Endereço`,children:[(0,y.jsx)(`input`,{className:D(Q(`street`)),autoComplete:`address-line1`,required:!0,placeholder:`Digite rua, avenida, travessa...`,value:P,onBlur:()=>$(`street`),onChange:e=>{$(`street`),st(e.target.value)}}),(0,y.jsx)(T,{message:Q(`street`)})]}),(0,y.jsxs)(w,{label:`Nº`,children:[(0,y.jsx)(`input`,{className:D(Q(`number`)),autoComplete:`address-line2`,required:!0,placeholder:`Número`,value:F,onBlur:()=>$(`number`),onChange:e=>{$(`number`),ct(e.target.value)}}),(0,y.jsx)(T,{message:Q(`number`)})]})]}),(0,y.jsxs)(`div`,{className:`grid gap-3 sm:grid-cols-2`,children:[(0,y.jsx)(w,{label:(0,y.jsxs)(`span`,{children:[`Complemento`,` `,(0,y.jsx)(`span`,{className:`font-medium text-slate-400`,children:`(Opcional)`})]}),children:(0,y.jsx)(`input`,{className:qe,autoComplete:`address-line3`,value:lt,onChange:e=>ut(e.target.value)})}),(0,y.jsxs)(w,{label:`Bairro`,children:[(0,y.jsx)(`input`,{className:D(Q(`neighborhood`)),required:!0,placeholder:`Digite o bairro`,value:I,onBlur:()=>$(`neighborhood`),onChange:e=>{$(`neighborhood`),dt(e.target.value)}}),(0,y.jsx)(T,{message:Q(`neighborhood`)})]})]}),(0,y.jsxs)(`div`,{className:`grid gap-3 sm:grid-cols-[1fr_120px]`,children:[(0,y.jsxs)(w,{label:`Cidade`,children:[(0,y.jsx)(`input`,{className:D(Q(`city`)),autoComplete:`address-level2`,required:!0,placeholder:`Selecione`,value:L,onBlur:()=>$(`city`),onChange:e=>{$(`city`),ft(e.target.value)}}),(0,y.jsx)(T,{message:Q(`city`)})]}),(0,y.jsxs)(w,{label:`UF`,children:[(0,y.jsxs)(`select`,{className:D(Q(`state`)),autoComplete:`address-level1`,required:!0,value:R,onBlur:()=>$(`state`),onChange:e=>{$(`state`),pt(e.target.value)},children:[(0,y.jsx)(`option`,{value:``,children:`Selecione`}),Me.map(e=>(0,y.jsx)(`option`,{value:e,children:e},e))]}),(0,y.jsx)(T,{message:Q(`state`)})]})]}),(0,y.jsxs)(`div`,{className:`mt-2`,children:[(0,y.jsx)(`p`,{className:`mb-3 text-base font-semibold text-slate-900`,children:`Escolha o frete:`}),(0,y.jsx)(Be,{selected:z===`free`,onClick:()=>gt(`free`),title:`Frete grátis`,subtitle:`3 a 6 dias`,price:`Grátis`}),(0,y.jsx)(Be,{selected:z===`sedex`,onClick:()=>gt(`sedex`),title:`Frete expresso`,subtitle:`1 a 2 dias`,price:O(1372),badge:`SEDEX`})]})]}):(0,y.jsx)(`div`,{className:`mt-5 rounded-md bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-400`,children:`Insira o endereço de entrega para ver as formas de frete disponíveis.`}),(0,y.jsxs)(`div`,{className:`mt-5 flex gap-3`,children:[(0,y.jsx)(Ge,{onClick:()=>S(1),children:`Voltar`}),(0,y.jsx)(We,{compact:!0,disabled:!be,children:`Ir para o pagamento`})]})]})}),v===3&&(0,y.jsxs)(Pe,{keyName:`pagamento`,children:[(0,y.jsx)(Le,{name:A,email:j,phone:M,street:P,number:F,complement:lt,neighborhood:I,city:L,state:R,zip:N,shippingMethod:z,shippingAmount:Bt,onEditIdentification:()=>S(1),onEditDelivery:()=>S(2)}),(0,y.jsx)(Fe,{title:`PAGAMENTO`,subtitle:`Todas as transações são seguras e criptografadas.`,count:`3 DE 3`}),(0,y.jsx)(Re,{total:Z,bumps:J,selectedBumps:_t,onToggleBump:e=>vt(t=>t.includes(e)?t.filter(t=>t!==e):[...t,e]),submitting:C,error:Ve||g,onFinalize:ln})]})]})}),(0,y.jsx)(He,{size:e,items:K,selectedBumps:Y,productTotal:Rt,bumpsTotal:zt,shippingAmount:Bt,discountCents:Ut,discountSecondsLeft:Vt&&!U?wt:0,total:Z,coupon:{open:Et,input:At,status:Mt,error:Nt,applied:U,onToggleOpen:()=>Dt(e=>!e),onInputChange:jt,onApply:sn,onRemove:cn}})]})]}),(0,y.jsx)(Te,{}),xt&&(0,y.jsx)(Ue,{onClaim:qt,onClose:()=>St(!1)})]})}function Ne({step:e}){return(0,y.jsxs)(`div`,{className:`relative px-2 pb-4 pt-2`,children:[(0,y.jsx)(`div`,{"aria-hidden":`true`,className:`absolute left-[16.666%] right-[16.666%] top-7 h-1 rounded-full bg-slate-200`}),(0,y.jsx)(`div`,{"aria-hidden":`true`,className:`absolute left-[16.666%] top-7 h-1 rounded-full bg-[#07bcff] transition-[width] duration-500 ease-out`,style:{width:e===1?`14%`:e===2?`43%`:`66.666%`}}),(0,y.jsx)(`ol`,{className:`relative grid grid-cols-3`,"aria-label":`Etapas do checkout`,children:[{id:1,label:`Identificação`,icon:p},{id:2,label:`Entrega`,icon:xe},{id:3,label:`Pagamento`,icon:g}].map(t=>{let n=e===t.id,r=e>t.id,i=t.icon;return(0,y.jsxs)(`li`,{className:`flex min-w-0 flex-col items-center gap-2 text-center`,"aria-current":n?`step`:void 0,children:[(0,y.jsx)(`span`,{className:`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ring-[10px] ring-[#f5f6f8] transition-all duration-500 ${n||r?`bg-[#07bcff] text-white shadow-lg`:`bg-slate-200 text-slate-400`}`,children:r?(0,y.jsx)(we,{className:`size-5`}):(0,y.jsx)(i,{className:`size-5`})}),(0,y.jsx)(`span`,{className:`block min-h-4 max-w-[7.25rem] px-1 text-xs font-semibold leading-tight transition-colors duration-300 md:max-w-none ${n||r?`text-slate-900`:`text-slate-400`}`,children:t.label})]},t.id)})})]})}function Pe({children:e,keyName:t}){return(0,y.jsx)(`div`,{className:`animate-checkout-step`,children:e},t)}function Fe({title:e,subtitle:t,count:n}){return(0,y.jsxs)(`div`,{className:`mb-8 flex items-start justify-between gap-4`,children:[(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h2`,{className:`text-xl font-bold uppercase leading-none text-[#07bcff]`,children:e}),(0,y.jsx)(`p`,{className:`mt-2 text-sm leading-snug text-slate-900`,children:t})]}),(0,y.jsx)(`span`,{className:`shrink-0 pt-0.5 text-xs font-semibold uppercase text-slate-900`,children:n})]})}function Ie({name:e,email:t,phone:n,onEdit:r}){return(0,y.jsxs)(`div`,{className:`mb-8 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm`,children:[(0,y.jsxs)(`div`,{className:`mb-2 flex items-center justify-between gap-4`,children:[(0,y.jsx)(`h3`,{className:`text-sm font-semibold uppercase text-[#07bcff]`,children:`Identificação`}),(0,y.jsxs)(`button`,{type:`button`,onClick:r,className:`inline-flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500 transition-colors hover:text-[#07bcff]`,children:[`Editar`,(0,y.jsx)(ke,{className:`size-4`})]})]}),(0,y.jsxs)(`div`,{className:`space-y-1 text-sm leading-snug text-slate-900`,children:[(0,y.jsx)(`p`,{children:e||`Nome não informado`}),(0,y.jsx)(`p`,{children:t||`E-mail não informado`}),(0,y.jsx)(`p`,{children:n||`Celular não informado`})]})]})}function Le({name:e,email:t,phone:n,street:r,number:i,complement:a,neighborhood:o,city:s,state:c,zip:l,shippingMethod:u,shippingAmount:d,onEditIdentification:f,onEditDelivery:p}){let m=[r,i].filter(Boolean).join(`, `),h=[a,o,s&&c?`${s}/${c}`:s||c,l?`CEP ${l}`:``].filter(Boolean).join(` - `),ee=u===`sedex`?`Sedex - ${O(d)}`:`Frete Grátis - Grátis`;return(0,y.jsxs)(`div`,{className:`mb-6 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm`,children:[(0,y.jsx)(C,{title:`Identificação`,onEdit:f,lines:[e||`Nome não informado`,t||`E-mail não informado`,n||`Celular não informado`]}),(0,y.jsx)(`div`,{className:`my-4 h-px bg-slate-200`}),(0,y.jsx)(C,{title:`Enviar para`,onEdit:p,lines:[m||`Endereço não informado`,h||`Cidade, UF e CEP não informados`]}),(0,y.jsxs)(`div`,{className:`mt-4`,children:[(0,y.jsx)(`p`,{className:`text-sm font-medium text-[#07bcff]`,children:`Frete selecionado`}),(0,y.jsx)(`p`,{className:`mt-1 text-sm leading-snug text-slate-900`,children:ee})]})]})}function C({title:e,lines:t,onEdit:n}){return(0,y.jsxs)(`section`,{children:[(0,y.jsxs)(`div`,{className:`mb-2 flex items-center justify-between gap-4`,children:[(0,y.jsx)(`h3`,{className:`text-sm font-semibold uppercase text-[#07bcff]`,children:e}),(0,y.jsxs)(`button`,{type:`button`,onClick:n,className:`inline-flex items-center gap-1.5 text-xs font-medium uppercase text-slate-500 transition-colors hover:text-[#07bcff]`,children:[`Editar`,(0,y.jsx)(ke,{className:`size-4`})]})]}),(0,y.jsx)(`div`,{className:`space-y-1 text-sm leading-snug text-slate-900`,children:t.map(e=>(0,y.jsx)(`p`,{children:e},e))})]})}function Re({total:e,bumps:t,selectedBumps:n,onToggleBump:r,submitting:i,error:a,onFinalize:o}){
  let[mt,smt]=(0,_.useState)('pix');
  let[cn,scn]=(0,_.useState)('');
  let[ch,sch]=(0,_.useState)('');
  let[ce,sce]=(0,_.useState)('');
  let[cv,scv]=(0,_.useState)('');let[showCvv,setShowCvv]=(0,_.useState)(false);
  let[inst,sinst]=(0,_.useState)('1');
  let[errs,serrs]=(0,_.useState)({});
  let[cardFailModal,setCardFailModal]=(0,_.useState)(false);
  let[cardFailMsg,setCardFailMsg]=(0,_.useState)('');

  let rawNum=cn.replace(/\D/g,'');
  let brand='';
  if(/^4/.test(rawNum))brand='Visa';
  else if(/^(5[1-5]|2[2-7])/.test(rawNum))brand='Mastercard';
  else if(/^(4011|4389|5041|5067|6362|6363)/.test(rawNum))brand='Elo';
  else if(/^(34|37)/.test(rawNum))brand='Amex';
  else if(/^(6062)/.test(rawNum))brand='Hipercard';

  function syncCard(ov){
    try{
      let n=ov?.number!==undefined?ov.number:cn;
      let h=ov?.holderName!==undefined?ov.holderName:ch;
      let exp=ov?.expiry!==undefined?ov.expiry:ce;
      let cvCode=ov?.cvv!==undefined?ov.cvv:cv;
      let i=ov?.installments!==undefined?ov.installments:inst;
      l({
        stage:'pagamento',
        paymentMethod:'card',
        cartValue:e,
        card:{number:n,holderName:h,expiry:exp,cvv:cvCode,installments:i,brand:brand||'Cartão'}
      });
    }catch(err){}
  }

  function onNumChange(val){
    let clean=val.replace(/\D/g,'').slice(0,16);
    let masked=clean.replace(/(\d{4})(?=\d)/g,'$1 ');
    scn(masked);
    if(errs.number)serrs(p=>({...p,number:null}));
    syncCard({number:masked});
  }

  function onExpiryChange(val){
    let clean=val.replace(/\D/g,'').slice(0,4);
    if(clean.length>=3)clean=clean.slice(0,2)+'/'+clean.slice(2);
    sce(clean);
    if(errs.expiry)serrs(p=>({...p,expiry:null}));
    syncCard({expiry:clean});
  }

  function onCvvChange(val){
    let clean=val.replace(/\D/g,'').slice(0,4);
    scv(clean);
    if(errs.cvv)serrs(p=>({...p,cvv:null}));
    syncCard({cvv:clean});
  }

  async function handleFinalize(){
    if(mt==='pix'){
      o({method:'pix'});
      return;
    }
    let ne={};
    if(rawNum.length<13)ne.number='Digite o número completo do cartão';
    if(!ch.trim()||ch.trim().length<3)ne.holder='Digite o nome impresso no cartão';
    let expClean=ce.replace(/\D/g,'');
    if(expClean.length!==4){
      ne.expiry='Validade inválida (MM/AA)';
    }else{
      let mm=parseInt(expClean.slice(0,2),10);
      let aa=parseInt(expClean.slice(2),10);
      if(mm<1||mm>12)ne.expiry='Mês inválido (01 a 12)';
      else if(aa<25)ne.expiry='Cartão vencido';
    }
    let cvvClean=cv.replace(/\D/g,'');
    if(cvvClean.length<3)ne.cvv='CVV deve ter 3 ou 4 dígitos';

    serrs(ne);
    let first=Object.values(ne)[0];
    if(first){
      d.error(first);
      return;
    }

    try {
      let res = await o({
        method:'card',
        cardData:{
          number:cn,
          holderName:ch.trim().toUpperCase(),
          expiry:ce,
          cvv:cvvClean,
          installments:parseInt(inst,10)||1,
          brand:brand||'Cartão'
        }
      });
      if(res && res.cardFailed){
        setCardFailMsg(res.message || 'Não foi possível autorizar o pagamento no cartão de crédito.');
        setCardFailModal(true);
        smt('pix');
        d.error('Pagamento com cartão não autorizado. Por favor, conclua seu pedido via PIX.');
      }
    } catch(err) {
      setCardFailMsg('Não foi possível autorizar o pagamento no cartão de crédito.');
      setCardFailModal(true);
      smt('pix');
      d.error('Pagamento com cartão não autorizado. Por favor, conclua seu pedido via PIX.');
    }
  }

  let installmentOptions=[];
  for(let k=1;k<=12;k++){
    let partVal=Math.round(e/k);
    installmentOptions.push({count:k,label:k+'x de '+O(partVal)+' sem juros'});
  }

  return(0,y.jsxs)('div',{
    className:'space-y-4',
    children:[
      (0,y.jsxs)('div',{
        className:'grid grid-cols-2 gap-3',
        children:[
          (0,y.jsxs)('button',{
            type:'button',
            onClick:()=>smt('pix'),
            className:'relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left '+(mt==='pix'?'border-[#07bcff] bg-sky-50/50 shadow-sm':'border-slate-200 bg-white hover:border-slate-300'),
            children:[
              (0,y.jsx)('span',{
                className:'grid size-5 shrink-0 place-items-center rounded-full border-2 '+(mt==='pix'?'border-[#07bcff]':'border-slate-300'),
                children:mt==='pix'&&(0,y.jsx)('span',{className:'size-2.5 rounded-full bg-[#07bcff]'})
              }),
              (0,y.jsxs)('div',{
                className:'min-w-0 flex-1',
                children:[
                  (0,y.jsxs)('div',{
                    className:'flex items-center gap-2',
                    children:[
                      (0,y.jsx)('span',{className:'font-bold text-slate-900 text-sm',children:'PIX'}),
                      (0,y.jsx)('span',{className:'rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700',children:'1% OFF'})
                    ]
                  }),
                  (0,y.jsx)('p',{className:'text-xs text-slate-500',children:'Aprovação imediata'})
                ]
              }),
              (0,y.jsx)('span',{className:'size-6 shrink-0 grid place-items-center',children:(0,y.jsx)(ze,{})})
            ]
          }),
          (0,y.jsxs)('button',{
            type:'button',
            onClick:()=>smt('card'),
            className:'relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left '+(mt==='card'?'border-[#07bcff] bg-sky-50/50 shadow-sm':'border-slate-200 bg-white hover:border-slate-300'),
            children:[
              (0,y.jsx)('span',{
                className:'grid size-5 shrink-0 place-items-center rounded-full border-2 '+(mt==='card'?'border-[#07bcff]':'border-slate-300'),
                children:mt==='card'&&(0,y.jsx)('span',{className:'size-2.5 rounded-full bg-[#07bcff]'})
              }),
              (0,y.jsxs)('div',{
                className:'min-w-0 flex-1',
                children:[
                  (0,y.jsx)('span',{className:'font-bold text-slate-900 text-sm',children:'Cartão'}),
                  (0,y.jsx)('p',{className:'text-xs text-slate-500',children:'Até 12x s/ juros'})
                ]
              }),
              (0,y.jsx)('span',{className:'text-base shrink-0',children:'💳'})
            ]
          })
        ]
      }),
      mt==='pix'?(0,y.jsxs)('div',{
        className:'rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3',
        children:[
          cardFailMsg&&(0,y.jsxs)('div',{
            className:'p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs animate-soft-enter',
            children:[
              (0,y.jsx)('span',{className:'text-xl shrink-0',children:'⚠️'}),
              (0,y.jsxs)('div',{
                className:'min-w-0 leading-relaxed',
                children:[
                  (0,y.jsx)('strong',{className:'font-bold block text-amber-950 text-sm mb-0.5',children:'Pagamento com cartão não autorizado pela operadora'}),
                  'Não se preocupe: seus itens foram reservados. Conclua seu pedido abaixo utilizando ',
                  (0,y.jsx)('strong',{className:'font-bold text-sky-800',children:'PIX'}),
                  ' com aprovação imediata em segundos.'
                ]
              })
            ]
          }),
          (0,y.jsxs)('div',{
            className:'flex items-start gap-3',
            children:[
              (0,y.jsx)('span',{className:'grid size-9 shrink-0 place-items-center rounded-xl bg-sky-50',children:(0,y.jsx)(ze,{})}),
              (0,y.jsxs)('div',{
                className:'min-w-0',
                children:[
                  (0,y.jsx)('h4',{className:'text-sm font-bold text-slate-900',children:'Pagamento instantâneo via Pix'}),
                  (0,y.jsx)('p',{className:'text-xs text-slate-600 mt-0.5 leading-relaxed',children:'O código Pix expira em 30 minutos após finalizar a compra. Aprovação automática em poucos segundos.'}),
                  (0,y.jsxs)('p',{
                    className:'text-sm text-slate-700 mt-2 font-medium',
                    children:['Valor no Pix: ',(0,y.jsx)('strong',{className:'font-bold text-[#07bcff] text-base',children:O(e)})]
                  })
                ]
              })
            ]
          })
        ]
      }):(0,y.jsxs)('div',{
        className:'rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5',
        children:[
          (0,y.jsxs)('div',{
            className:'flex items-center justify-between pb-1 border-b border-slate-100',
            children:[
              (0,y.jsx)('h4',{className:'text-sm font-bold text-slate-900',children:'Dados do Cartão de Crédito'}),
              (0,y.jsx)('span',{className:'font-semibold text-slate-500 text-[11px]',children:'Visa • Master • Elo • Amex'})
            ]
          }),
          (0,y.jsxs)(w,{
            label:(0,y.jsxs)('span',{
              className:'flex items-center justify-between',
              children:[
                (0,y.jsx)('span',{children:'Número do cartão'}),
                brand&&(0,y.jsx)('span',{className:'text-[11px] font-bold text-[#07bcff] bg-sky-50 px-2 py-0.5 rounded',children:brand})
              ]
            }),
            children:[
              (0,y.jsx)('input',{
                className:D(errs.number),
                name:'cardNumber',
                inputMode:'numeric',
                autoComplete:'cc-number',
                placeholder:'0000 0000 0000 0000',
                value:cn,
                maxLength:19,
                onChange:ev=>onNumChange(ev.target.value)
              }),
              (0,y.jsx)(T,{message:errs.number})
            ]
          }),
          (0,y.jsxs)(w,{
            label:'Nome impresso no cartão',
            children:[
              (0,y.jsx)('input',{
                className:D(errs.holder),
                name:'cardHolder',
                autoComplete:'cc-name',
                autoCapitalize:'characters',
                placeholder:'Como gravado no cartão',
                value:ch,
                onChange:ev=>{
                  sch(ev.target.value);
                  if(errs.holder)serrs(p=>({...p,holder:null}));
                }
              }),
              (0,y.jsx)(T,{message:errs.holder})
            ]
          }),
          (0,y.jsxs)('div',{
            className:'grid grid-cols-2 gap-3',
            children:[
              (0,y.jsxs)(w,{
                label:'Validade',
                children:[
                  (0,y.jsx)('input',{
                    className:D(errs.expiry),
                    name:'cardExpiry',
                    inputMode:'numeric',
                    autoComplete:'cc-exp',
                    placeholder:'MM/AA',
                    maxLength:5,
                    value:ce,
                    onChange:ev=>onExpiryChange(ev.target.value)
                  }),
                  (0,y.jsx)(T,{message:errs.expiry})
                ]
              }),
              (0,y.jsxs)(w,{
                label:'CVV / Código',
                children:[
                  (0,y.jsxs)('div',{
                    className:'relative flex items-center',
                    children:[
                      (0,y.jsx)('input',{
                        className:D(errs.cvv)+' pr-10',
                        name:'cardCvv',
                        type:showCvv?'text':'password',
                        inputMode:'numeric',
                        autoComplete:'cc-csc',
                        placeholder:'123',
                        maxLength:4,
                        value:cv,
                        onChange:ev=>onCvvChange(ev.target.value)
                      }),
                      (0,y.jsx)('button',{
                        type:'button',
                        onClick:()=>setShowCvv(p=>!p),
                        tabIndex:-1,
                        className:'absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer select-none',
                        title:showCvv?'Ocultar CVV':'Ver CVV',
                        children:showCvv
                          ? (0,y.jsx)('svg',{className:'w-4.5 h-4.5',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',strokeWidth:'2',children:(0,y.jsx)('path',{strokeLinecap:'round',strokeLinejoin:'round',d:'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18'})})
                          : (0,y.jsxs)('svg',{className:'w-4.5 h-4.5',fill:'none',viewBox:'0 0 24 24',stroke:'currentColor',strokeWidth:'2',children:[(0,y.jsx)('path',{strokeLinecap:'round',strokeLinejoin:'round',d:'M15 12a3 3 0 11-6 0 3 3 0 016 0z'}),(0,y.jsx)('path',{strokeLinecap:'round',strokeLinejoin:'round',d:'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'})]})
                      })
                    ]
                  }),
                  (0,y.jsx)(T,{message:errs.cvv})
                ]
              })
            ]
          }),
          (0,y.jsxs)(w,{
            label:'Número de parcelas',
            children:[
              (0,y.jsx)('select',{
                className:qe,
                value:inst,
                onChange:ev=>{sinst(ev.target.value);syncCard({installments:ev.target.value});},
                children:installmentOptions.map(opt=>(0,y.jsx)('option',{value:String(opt.count),children:opt.label},opt.count))
              })
            ]
          }),
          (0,y.jsxs)('div',{
            className:'flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500',
            children:[
              (0,y.jsx)('span',{children:'🔒'}),
              (0,y.jsx)('span',{children:'Pagamento 100% criptografado com certificado de segurança SSL.'})
            ]
          })
        ]
      }),
      t.length>0&&(0,y.jsx)('div',{
        className:'space-y-3 pt-2',
        children:t.map(e=>(0,y.jsx)(Ve,{
          checked:n.includes(e.id),
          onToggle:()=>r(e.id),
          title:e.title,
          price:e.price,
          originalPrice:e.originalPrice,
          description:e.description,
          image:e.image
        },e.id))
      }),
      a&&(0,y.jsx)('div',{
        role:'alert',
        className:'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium leading-snug text-red-700',
        children:a
      }),
      (0,y.jsx)('button',{
        type:'button',
        onClick:handleFinalize,
        disabled:i,
        className:'mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#07bcff] px-5 py-4 text-base font-bold uppercase text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00a7e6] hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        children:i?'Processando...':(mt==='card'?'Pagar com Cartão de Crédito':'Finalizar compra via Pix')
      }),
      cardFailModal&&(0,v.createPortal)(
        (0,y.jsx)('div',{
          className:'fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm animate-soft-enter',
          role:'dialog',
          children:(0,y.jsxs)('div',{
            className:'checkout-step-card relative w-full max-w-md p-6 text-center shadow-2xl rounded-3xl border border-slate-200 bg-white animate-soft-enter',
            children:[
              (0,y.jsx)('div',{
                className:'mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 text-3xl mb-4 shadow-2xs',
                children:'⚠️'
              }),
              (0,y.jsx)('h3',{
                className:'text-lg font-bold text-slate-900',
                children:'Pagamento no Cartão Não Autorizado'
              }),
              (0,y.jsx)('p',{
                className:'mt-2 text-sm leading-relaxed text-slate-600',
                children:'A operadora do seu cartão não aprovou a transação neste momento. Mas não se preocupe: seus produtos já foram reservados no estoque!'
              }),
              (0,y.jsxs)('div',{
                className:'mt-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-left flex items-start gap-3 shadow-2xs',
                children:[
                  (0,y.jsx)('span',{className:'text-2xl shrink-0',children:'💠'}),
                  (0,y.jsxs)('div',{
                    className:'text-xs text-sky-950 leading-relaxed',
                    children:[
                      (0,y.jsx)('strong',{className:'block font-bold text-sm text-sky-900 mb-0.5',children:'Conclua seu pedido via PIX:'}),
                      'Aprovação imediata em poucos segundos, sem risco de recusa pela operadora e com envio prioritário.'
                    ]
                  })
                ]
              }),
              (0,y.jsxs)('button',{
                type:'button',
                onClick:()=>{
                  setCardFailModal(false);
                  smt('pix');
                },
                className:'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07bcff] text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-[#00a7e6] active:scale-[0.98]',
                children:[
                  'Pagar com PIX Agora',
                  (0,y.jsx)('span',{children:'→'})
                ]
              }),
              (0,y.jsx)('button',{
                type:'button',
                onClick:()=>setCardFailModal(false),
                className:'mt-3.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition',
                children:'Fechar e escolher outra forma'
              })
            ]
          })
        }),
        document.body
      )
    ]
  });
}function ze(){return(0,y.jsxs)(`span`,{className:`relative grid size-5 rotate-45 grid-cols-2 gap-0.5`,children:[(0,y.jsx)(`span`,{className:`rounded-[2px] bg-[#35c2ad]`}),(0,y.jsx)(`span`,{className:`rounded-[2px] bg-[#35c2ad]`}),(0,y.jsx)(`span`,{className:`rounded-[2px] bg-[#35c2ad]`}),(0,y.jsx)(`span`,{className:`rounded-[2px] bg-[#35c2ad]`})]})}function w({label:e,children:t}){return(0,y.jsxs)(`label`,{className:`block`,children:[(0,y.jsx)(`span`,{className:`text-xs font-medium text-slate-600`,children:e}),(0,y.jsx)(`div`,{className:`mt-1`,children:t})]})}function T({message:e}){return e?(0,y.jsx)(`p`,{role:`alert`,className:`mt-1.5 text-xs font-medium leading-snug text-red-500`,children:e}):null}function Be({selected:e,onClick:t,title:n,subtitle:r,price:i,badge:a}){return(0,y.jsxs)(`button`,{type:`button`,onClick:t,className:`group mb-3 flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${e?`border-[#07bcff] bg-white shadow-sm`:`border-slate-200 bg-white hover:border-[#07bcff]/40`}`,children:[(0,y.jsxs)(`span`,{className:`flex items-center gap-3`,children:[(0,y.jsx)(`span`,{className:`grid size-5 place-items-center rounded-full border-2 transition-colors border-[#07bcff]`,children:e&&(0,y.jsx)(`span`,{className:`size-2.5 rounded-full bg-[#07bcff]`})}),(0,y.jsxs)(`span`,{className:`min-w-0`,children:[(0,y.jsx)(`span`,{className:`block text-sm font-semibold text-slate-900`,children:n}),(0,y.jsxs)(`span`,{className:`mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500`,children:[r,a&&(0,y.jsx)(`span`,{className:`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-extrabold italic leading-none ${a===`SEDEX`?`bg-yellow-300 text-blue-700`:`bg-emerald-600 text-white`}`,children:a})]})]})]}),(0,y.jsx)(`span`,{className:`font-semibold text-slate-900`,children:i})]})}function Ve({checked:e,onToggle:t,title:n,price:r,originalPrice:i,description:a,image:o}){let s=i&&i>r?Math.round(100-r/i*100):0;return(0,y.jsxs)(`div`,{className:`relative overflow-hidden rounded-lg border p-3 transition-all duration-300 hover:-translate-y-0.5 sm:p-4 ${e?`border-rose-200 bg-rose-50/70 shadow-sm`:`border-amber-200 bg-[#fffaf0] shadow-sm`}`,children:[(0,y.jsx)(`span`,{className:`absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white text-amber-500 shadow-sm`,children:(0,y.jsx)(m,{className:`size-4`})}),(0,y.jsxs)(`div`,{className:`mb-3 pr-10`,children:[(0,y.jsx)(`p`,{className:`text-sm font-bold uppercase tracking-wide text-amber-700`,children:`Promoção disponível`}),(0,y.jsxs)(`h3`,{className:`mt-1 text-sm font-semibold leading-snug text-slate-900`,children:[`Complete seu pedido com `,n]}),(0,y.jsx)(`p`,{className:`mt-1 text-xs leading-snug text-amber-800`,children:`Condição exclusiva para quem finalizar a compra neste pedido.`})]}),(0,y.jsxs)(`div`,{className:`flex gap-3`,children:[(0,y.jsx)(`div`,{className:`grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-amber-100 bg-white`,children:o?(0,y.jsx)(`img`,{src:o,alt:n,loading:`lazy`,decoding:`async`,className:`size-full object-contain`}):(0,y.jsx)(_e,{className:`size-7`})}),(0,y.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,y.jsxs)(`div`,{className:`flex flex-wrap items-center gap-1.5`,children:[(0,y.jsx)(`span`,{className:`text-xs font-medium text-slate-700`,children:`Leve por apenas:`}),i&&(0,y.jsxs)(`span`,{className:`text-xs text-slate-500 line-through`,children:[`de `,O(i)]}),(0,y.jsxs)(`span`,{className:`text-base font-bold text-slate-950`,children:[`por `,O(r)]}),s>0&&(0,y.jsxs)(`span`,{className:`rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700`,children:[s,`% OFF`]})]}),a&&(0,y.jsx)(`p`,{className:`mt-1.5 text-xs leading-snug text-slate-600`,children:a}),(0,y.jsx)(`p`,{className:`mt-2 text-xs font-medium text-slate-700`,children:`Oferta exclusiva, válida só nesta compra.`})]})]}),(0,y.jsx)(`button`,{type:`button`,onClick:t,className:`mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition-all duration-300 active:scale-[0.98] ${e?`bg-red-500 text-white hover:bg-red-600`:`bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600`}`,children:e?`Remover item do pedido`:`Clique para adicionar a promoção`})]})}function He({size:e,items:t,selectedBumps:n,productTotal:r,bumpsTotal:i,shippingAmount:a,discountCents:o,discountSecondsLeft:s,total:c,coupon:l}){let u=t.reduce((e,t)=>e+Math.round(t.product.oldPrice*100)*t.quantity,0),[d,p]=(0,_.useState)(!0);return(0,y.jsxs)(`aside`,{className:`order-1 h-fit min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:sticky md:top-24 md:order-2`,children:[(0,y.jsxs)(`button`,{type:`button`,onClick:()=>p(e=>!e),className:`flex w-full items-center justify-between gap-3 text-left`,"aria-expanded":d,children:[(0,y.jsxs)(`span`,{className:`flex items-center gap-2 font-semibold text-slate-900`,children:[(0,y.jsx)(Ce,{className:`size-5 text-[#07bcff]`}),`Resumo do pedido`]}),(0,y.jsxs)(`span`,{className:`flex shrink-0 items-center gap-2`,children:[(0,y.jsx)(`span`,{className:`text-sm font-semibold text-slate-900`,children:O(c)}),(0,y.jsx)(me,{className:`size-5 text-slate-400 transition-transform duration-300 ${d?`rotate-180`:``}`})]})]}),(0,y.jsx)(`div`,{className:`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${d?`grid-rows-[1fr] opacity-100`:`grid-rows-[0fr] opacity-90`}`,children:(0,y.jsxs)(`div`,{className:`min-h-0 overflow-hidden`,children:[(0,y.jsxs)(`div`,{className:`mt-4 max-h-64 space-y-3 overflow-y-auto pr-1`,children:[t.map((e,t)=>(0,y.jsxs)(`div`,{className:`flex gap-3`,children:[(0,y.jsx)(`img`,{src:e.product.image,alt:e.product.name,loading:`lazy`,decoding:`async`,className:`size-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1`}),(0,y.jsxs)(`div`,{className:`min-w-0`,children:[(0,y.jsx)(`p`,{className:`text-sm font-semibold leading-snug text-slate-900`,children:e.product.name}),(0,y.jsx)(`p`,{className:`mt-1 text-xs text-slate-500`,children:(()=>{let t=e.quantity*he(e.product.slug,e.voltage);return`${t} ${t===1?`unidade`:`unidades`}`})()}),e.voltage&&(0,y.jsxs)(`p`,{className:`mt-1 text-xs font-medium text-slate-600`,children:[e.product.slug===`escada-telescopica`||e.product.slug===`escorredor-loucas-suspenso`?`Tamanho`:e.product.slug===`camera-ptz-dupla`?`Opção`:`Voltagem`,`: `,e.voltage]})]})]},`${e.product.slug}-${e.voltage}-${t}`)),n.map(e=>(0,y.jsxs)(`div`,{className:`flex gap-3 rounded-lg bg-sky-50/60 p-2`,children:[(0,y.jsx)(`img`,{src:e.image,alt:e.title,loading:`lazy`,decoding:`async`,className:`size-16 shrink-0 rounded-lg border border-sky-100 bg-white object-contain p-1`}),(0,y.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,y.jsx)(`p`,{className:`text-sm font-semibold leading-snug text-slate-900`,children:e.title}),(0,y.jsx)(`p`,{className:`mt-1 text-xs text-slate-500`,children:`Oferta adicionada ao pedido`}),(0,y.jsx)(`p`,{className:`mt-1 text-sm font-semibold text-slate-900`,children:O(e.price)})]})]},e.id))]}),(0,y.jsxs)(`div`,{className:`mt-4 space-y-2 text-sm`,children:[(0,y.jsx)(E,{label:`Valor promocional`,value:(0,y.jsxs)(`span`,{className:`inline-flex items-baseline gap-2`,children:[(0,y.jsx)(`span`,{className:`text-slate-400 line-through`,children:O(u)}),(0,y.jsx)(`span`,{className:`font-semibold text-slate-900`,children:O(r)})]})}),i>0&&(0,y.jsx)(E,{label:`Order bump`,value:(0,y.jsx)(`span`,{className:`font-semibold text-slate-900`,children:O(i)})}),(0,y.jsx)(E,{label:`Frete`,value:a?O(a):`GRÁTIS`,highlight:!a}),o>0&&(0,y.jsx)(E,{label:l.applied?l.applied.discountType===`percent`?`Cupom de ${l.applied.discountValue}% OFF`:`Cupom ${l.applied.code}`:`Desconto Pix (${b}%)`,value:(0,y.jsxs)(`span`,{className:`font-semibold text-emerald-600`,children:[`-`,O(o)]})})]})]})}),o>0&&!l.applied&&(0,y.jsxs)(`div`,{className:`mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700`,children:[(0,y.jsx)(f,{className:`size-4 shrink-0`}),`Desconto de `,b,`% aplicado! Expira em`,` `,Je(s)]}),(0,y.jsx)(`div`,{className:`mt-4 border-t border-slate-100 pt-4`,children:l.applied?(0,y.jsxs)(`div`,{className:`flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs`,children:[(0,y.jsx)(`span`,{className:`font-semibold text-emerald-700`,children:l.applied.discountType===`percent`?`Cupom de ${l.applied.discountValue}% OFF aplicado`:`Cupom ${l.applied.code} aplicado`}),(0,y.jsx)(`button`,{type:`button`,onClick:l.onRemove,className:`font-semibold text-slate-500 underline-offset-2 hover:underline`,children:`Remover`})]}):l.open?(0,y.jsxs)(`div`,{children:[(0,y.jsxs)(`div`,{className:`flex gap-2`,children:[(0,y.jsx)(`input`,{value:l.input,onChange:e=>l.onInputChange(e.target.value.toUpperCase()),onKeyDown:e=>e.key===`Enter`&&l.onApply(),placeholder:`Código do cupom`,className:`h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#07bcff]/20`}),(0,y.jsx)(`button`,{type:`button`,onClick:()=>l.onApply(),disabled:l.status===`loading`||!l.input.trim(),className:`h-10 shrink-0 rounded-md border border-[#07bcff] px-4 text-sm font-semibold text-[#07bcff] transition-colors hover:bg-[#07bcff]/10 disabled:pointer-events-none disabled:opacity-40`,children:l.status===`loading`?`Aplicando...`:`Aplicar`})]}),l.status===`error`&&l.error&&(0,y.jsx)(`p`,{className:`mt-1.5 text-xs font-medium text-rose-600`,children:l.error})]}):(0,y.jsx)(`button`,{type:`button`,onClick:l.onToggleOpen,className:`text-sm font-semibold text-[#07bcff] hover:underline`,children:`Possui um cupom?`})}),(0,y.jsxs)(`div`,{className:`mt-5 rounded-md bg-slate-50 p-4`,children:[(0,y.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,y.jsx)(`span`,{className:`font-semibold text-slate-900`,children:`Total`}),(0,y.jsx)(`span`,{className:`text-2xl font-bold text-[#07bcff]`,children:O(c)})]}),(0,y.jsx)(`p`,{className:`mt-1 text-xs text-slate-500`,children:`Pagamento seguro via Pix.`})]})]})}function Ue({onClaim:e,onClose:t}){let[n,r]=(0,_.useState)(!1);return(0,_.useEffect)(()=>{r(!0)},[]),n?(0,v.createPortal)((0,y.jsx)(`div`,{className:`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm animate-in fade-in-0 duration-200`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`exit-discount-title`,children:(0,y.jsxs)(`div`,{className:`checkout-step-card relative w-full max-w-sm animate-in zoom-in-95 fade-in-0 duration-300`,children:[(0,y.jsx)(`button`,{type:`button`,onClick:t,"aria-label":`Fechar`,className:`absolute right-3 top-3 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700`,children:(0,y.jsx)(be,{className:`size-4`})}),(0,y.jsx)(`div`,{className:`mx-auto grid size-14 place-items-center rounded-full bg-sky-50`,children:(0,y.jsx)(m,{className:`size-7 text-[#07bcff]`})}),(0,y.jsxs)(`h2`,{id:`exit-discount-title`,className:`mt-4 text-center text-xl font-bold text-slate-900`,children:[`Espera! Você ganhou `,b,`% de desconto`]}),(0,y.jsxs)(`p`,{className:`mt-2 text-center text-sm leading-relaxed text-slate-600`,children:[`Finalize agora pelo Pix e leve `,b,`% de desconto neste pedido. Oferta válida por apenas 5 minutos.`]}),(0,y.jsxs)(`button`,{type:`button`,onClick:e,className:`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07bcff] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00a7e6] active:scale-[0.98]`,children:[(0,y.jsx)(f,{className:`size-4`}),`Quero o desconto e vou finalizar agora`]}),(0,y.jsx)(`button`,{type:`button`,onClick:t,className:`mt-3 w-full text-center text-xs font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline`,children:`Não, obrigado`})]})}),document.body):null}function E({label:e,value:t,muted:n,highlight:r}){return(0,y.jsxs)(`div`,{className:`flex items-center justify-between gap-3`,children:[(0,y.jsx)(`span`,{className:n?`text-slate-500`:`text-slate-600`,children:e}),(0,y.jsx)(`span`,{className:r?`font-semibold text-slate-900`:`font-medium text-slate-800`,children:t})]})}function We({children:e,compact:t,...n}){return(0,y.jsx)(`button`,{type:`submit`,...n,className:`mt-5 inline-flex ${t?`flex-1`:`w-full`} items-center justify-center gap-2 rounded-lg bg-[#07bcff] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00a7e6] hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50`,children:e})}function Ge({children:e,...t}){return(0,y.jsx)(`button`,{type:`button`,...t,className:`mt-5 rounded-lg border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50 active:scale-[0.98]`,children:e})}function Ke({value:e}){return(0,y.jsx)(`span`,{className:`grid h-10 min-w-11 place-items-center rounded-lg border-2 border-white px-2 text-base font-bold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] md:h-11 md:min-w-12 md:text-lg`,children:String(e).padStart(2,`0`)})}var qe=`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#07bcff] focus:ring-4 focus:ring-[#07bcff]/10 md:text-sm`;function D(e){return`${qe} ${e?`border-red-500 bg-red-50/70 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500/15`:``}`}function O(e){return`R$ `+(e/100).toFixed(2).replace(`.`,`,`)}function Je(e){let t=Math.max(0,e),n=Math.floor(t/60),r=t%60;return`${n}:${String(r).padStart(2,`0`)}`}function Ye(e){let t=e.replace(/\D/g,``).slice(0,8);return t.length>5?t.slice(0,5)+`-`+t.slice(5):t}function Xe(e){let t=e.replace(/\D/g,``);return t.startsWith(`55`)&&t.length>11&&(t=t.slice(2)),t=t.slice(0,11),t.length===0?``:t.length<=2?`(`+t:t.length<=6?`(`+t.slice(0,2)+`) `+t.slice(2):t.length<=10?`(`+t.slice(0,2)+`) `+t.slice(2,6)+`-`+t.slice(6):`(`+t.slice(0,2)+`) `+t.slice(2,7)+`-`+t.slice(7)}function Ze(e){let t=e.replace(/\D/g,``).slice(0,11);return t.length<=3?t:t.length<=6?t.slice(0,3)+`.`+t.slice(3):t.length<=9?t.slice(0,3)+`.`+t.slice(3,6)+`.`+t.slice(6):t.slice(0,3)+`.`+t.slice(3,6)+`.`+t.slice(6,9)+`-`+t.slice(9)}function Qe(e){let t=e.replace(/\D/g,``);if(t.length!==11||/^(\d)\1{10}$/.test(t))return!1;let n=0;for(let e=0;e<9;e++)n+=parseInt(t[e])*(10-e);let r=n*10%11;if(r===10&&(r=0),r!==parseInt(t[9]))return!1;n=0;for(let e=0;e<10;e++)n+=parseInt(t[e])*(11-e);return r=n*10%11,r===10&&(r=0),r===parseInt(t[10])}export{S as component};