async function kWrap(plan){
 const phone=plan.platform==='mobile',W=phone?698:1768,H=plan.height+152,group=plan.group;let wrapper=plan.wrapper,ui=plan.ui;
 if(!wrapper){const existing=(await figma.getChildren(group)).find(n=>n.name===(phone?'APP/':'WEB/')+plan.key);if(existing)wrapper=existing.id;else wrapper=(await figma.create({type:'FRAME',parentId:group,name:(phone?'APP/':'WEB/')+plan.key,x:40,y:190,width:W,height:H,fill:'#F7F7F7',cornerRadius:8})).id;}
 if(!ui){const existing=(await figma.getChildren(wrapper)).find(n=>n.name==='UI/'+plan.key);if(existing)ui=existing.id;else ui=(await figma.create({type:'FRAME',parentId:wrapper,name:'UI/'+plan.key,x:24,y:104,width:phone?390:1440,height:plan.height,fill:'#FFFFFF',cornerRadius:phone?24:8})).id;}
 for(const n of await figma.getChildren(wrapper))if(n.id!==ui)await figma.delete(n.id);
 await figma.modify(wrapper,{width:W,height:H,fill:'#F7F7F7',cornerRadius:8});await figma.modify(ui,{x:24,y:104,width:phone?390:1440,height:plan.height});
 await kText(wrapper,'Title',plan.key+' / '+plan.title,24,20,W-48,24,true,true);
 await kText(wrapper,'Subtitle','Bộ hiện hành · '+(phone?'Mobile':'Web desktop')+' · '+(phone?390:1440)+' × '+plan.height+' px · ID '+plan.ids.join(', '),24,66,W-48,14,false,false,'#666666');
 for(let i=0;i<plan.notes.length;i++){const x=phone?448:1488,y=160+i*Math.max(250,(plan.height-160)/3),w=phone?226:256,card=await kFrame(wrapper,'Note'+i,x,y,w,220);await kText(card.id,'Index','0'+(i+1),16,16,w-32,12,true,false,'#666666');await kText(card.id,'Title',plan.notes[i][0],16,54,w-32,18,true,true);await kText(card.id,'Body',plan.notes[i][1],16,102,w-32,14,false,false,'#666666');}
 return {...plan,wrapper,ui};
}

async function kRearrange(){
 for(const [group,prefix,cols,stepX,stepY,height]of [['6:444','WEB/',3,1800,1512,7780],['6:772','APP/',5,722,1432,6000]]){const items=(await figma.getChildren(group)).filter(n=>n.name.startsWith(prefix)&&/\/[WM]\d+$/.test(n.name)).sort((a,b)=>parseInt(a.name.match(/\d+$/)[0])-parseInt(b.name.match(/\d+$/)[0]));for(let i=0;i<items.length;i++)await figma.modify(items[i].id,{x:40+i%cols*stepX,y:190+Math.floor(i/cols)*stepY});await figma.modify(group,{width:group==='6:772'?3666:5440,height});}
 await figma.modify('6:772',{y:9300});await figma.modify('6:1227',{y:15500});await figma.modify('7:1306',{y:16970,height:6000});await figma.modify('8:1880',{y:23170,height:3360});
 const rpt=await figma.getChildren('8:1880');for(const n of rpt){const number=n.name.startsWith('R0')?parseInt(n.name.slice(1,3)):0;if(number>=5)await figma.modify(n.id,{x:number===9?3230:number===8?2500:40+(number-5)*690,y:1860});}
}
