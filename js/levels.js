// Each # is solid, ? is a reward block, B is breakable, C is a coin,
// E is an enemy, H a checkpoint, P a power-up, M a moving platform,
// S is a secret bonus, G is the goal, and . is empty air.
const build = (number, name, theme, segments) => {
  const width = 108, height = 17;
  const cells = Array.from({length:height},()=>Array(width).fill("."));
  const put=(x,y,c)=>{if(x>=0&&x<width&&y>=0&&y<height)cells[y][x]=c;};
  for(let x=0;x<width;x++){if(!segments.gaps.some(([a,b])=>x>=a&&x<=b)){put(x,15,"#");put(x,16,"#");}}
  segments.platforms.forEach(([x,y,n])=>{for(let i=0;i<n;i++)put(x+i,y,"#");});
  segments.blocks.forEach(([x,y,c])=>put(x,y,c));
  segments.coins.forEach(([x,y,n])=>{for(let i=0;i<n;i++)put(x+i,y,"C");});
  segments.enemies.forEach(x=>put(x,14,"E"));
  segments.powerups.forEach(x=>put(x,13,"P"));
  segments.movers.forEach(([x,y])=>put(x,y,"M"));
  put(segments.checkpoint,14,"H"); put(width-4,14,"G");
  return {number,name,theme,tiles:cells.map(row=>row.join("")),start:{x:2,y:12}};
};
export const LEVELS=[
  build(1,"Pradarias do Amanhecer","day",{gaps:[[19,21],[51,53],[78,80]],platforms:[[10,11,7],[28,12,9],[41,10,8],[61,11,9],[88,12,8]],blocks:[[13,8,"?"],[31,9,"B"],[44,7,"?"],[67,8,"?"],[90,9,"B"]],coins:[[7,12,5],[29,10,6],[44,8,4],[61,9,5],[89,10,5]],enemies:[16,34,48,71,91],powerups:[36,83],movers:[[20,12]],checkpoint:57}),
  build(2,"Colinas do Crepúsculo","sunset",{gaps:[[15,18],[38,41],[69,73],[91,94]],platforms:[[11,10,5],[25,11,7],[47,9,9],[62,12,6],[80,10,8]],blocks:[[13,7,"?"],[29,8,"B"],[51,6,"?"],[83,7,"?"],[100,11,"B"]],coins:[[10,8,5],[25,9,7],[48,7,7],[81,8,7],[97,12,5]],enemies:[24,35,46,59,77,87,101],powerups:[33,78],movers:[[16,12],[71,12]],checkpoint:55}),
  build(3,"Fortaleza das Estrelas","night",{gaps:[[13,17],[30,34],[57,62],[80,84],[95,98]],platforms:[[9,10,7],[21,9,7],[39,11,8],[49,8,6],[69,9,9],[88,10,7]],blocks:[[23,6,"?"],[41,8,"B"],[51,5,"?"],[74,6,"?"],[90,7,"B"]],coins:[[9,8,6],[22,7,5],[39,9,7],[69,7,8],[88,8,5]],enemies:[20,28,38,47,55,67,76,89,101],powerups:[36,79],movers:[[15,12],[60,11],[82,11]],checkpoint:65})
];