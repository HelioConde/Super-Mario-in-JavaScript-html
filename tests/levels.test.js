import test from "node:test";
import assert from "node:assert/strict";
import {LEVELS} from "../js/levels.js";
test("three progressive playable maps",()=>{
 assert.equal(LEVELS.length,3);
 for(const [i,level] of LEVELS.entries()){
  assert.equal(level.number,i+1);
  assert.equal(level.tiles.length,17);
  assert.equal(level.tiles[0].length,108);
  assert.ok(level.tiles.every(row=>row.length===108));
  for(const token of ["G","H","E","C","?","P","M"])assert.ok(level.tiles.some(row=>row.includes(token)),`missing ${token} on level ${i+1}`);
  assert.ok(level.tiles[15].includes("#"));
 }
});
test("levels do not have identical layouts",()=>{
 assert.notEqual(LEVELS[0].tiles.join(""),LEVELS[1].tiles.join(""));
 assert.notEqual(LEVELS[1].tiles.join(""),LEVELS[2].tiles.join(""));
});
test("spawn has space to fall onto a platform",()=>{
 for(const level of LEVELS){
  assert.equal(level.tiles[level.start.y][level.start.x],".");
  assert.equal(level.tiles[15][level.start.x],"#");
 }
});
