const EcoAI = (()=>{
  function fits(w,h,a,b){return (w>=a&&h>=b)||(w>=b&&h>=a);}
  function evaluate(s){
    const missing=[];
    if(!s.observed) missing.push('observation');
    if(!s.clean) missing.push('clean');
    if(!['yes','no'].includes(s.wearable)) missing.push('wearable');
    if(s.wearable==='yes') return {route:missing.length?'hold':'B',missing,matches:[],productionAllowed:false};
    if(!['denim','cotton'].includes(s.fabric)||!['label','manual'].includes(s.basis)) missing.push('material');
    const w=Number(s.width),h=Number(s.height),n=Number(s.panels);
    if(!Number.isFinite(w)||!Number.isFinite(h)||!Number.isInteger(n)||w<=0||h<=0||n<1) missing.push('dimensions');
    if(missing.length) return {route:'hold',missing,matches:[],productionAllowed:false};
    const m=(id,fit,reason,requirement)=>({id,fit,reason,requirement,enabled:false,specStatus:'demo_assumption_not_validated'});
    const matches=s.fabric==='denim'?[
      m('T01',false,s.cardboard?'盒体裁片及包覆工艺仍待打样，不能仅凭有纸板通过。':'还缺合适纸板；盒体裁片与包覆工艺也待验证。','牛仔布＋纸板；裁片规格尚未定稿'),
      m('T02',n>=2&&fits(w,h,23,14),n<2?'至少需要两块合格布片。':fits(w,h,23,14)?'两块布面达到本演示的预置条件；须避开破损。':'可用尺寸不足；不能用衣服总尺寸替代。','演示假设：两片各至少23×14cm，可旋转；正式规格待打样'),
      m('T04',n>=2&&fits(w,h,30,23),n<2?'至少需要两块合格布片。':fits(w,h,30,23)?'布面达到本演示预置条件；内衬和工序仍需复核。':'布面不足以满足这款演示裁片条件。','演示假设：两片各至少30×23cm，可旋转；正式规格待打样')
    ]:[m('T03',false,'需补连续布条总长度、弹性与缩水验证；单块长宽不足以批准制作。','棉质旧T恤；布条与编织工序参数待打样')];
    return {route:'A',missing:[],matches,productionAllowed:false};
  }
  function review(s,id,checks,outcome){
    if(outcome==='return') return {status:'returned',productionAllowed:false};
    const r=evaluate(s);
    const permitted=r.route==='B'||(r.route==='A'&&r.matches.some(t=>t.id===id&&t.fit));
    if(outcome!=='pass'||!permitted||checks.length!==3||checks.some(c=>c!==true)) return {status:'blocked',productionAllowed:false};
    return {status:'recorded_demo',route:r.route,templateId:r.route==='A'?id:null,productionAllowed:false};
  }
  return {evaluate,review};
})();
if(typeof module!=='undefined') module.exports=EcoAI;
