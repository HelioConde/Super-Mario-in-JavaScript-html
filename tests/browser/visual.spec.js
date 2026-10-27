import {test,expect} from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts/screenshots",{recursive:true});
for(const device of [{name:"desktop",width:1440,height:900},{name:"mobile",width:390,height:844},{name:"small",width:320,height:640}]){
 test(device.name+" - menu, game and photo",async({page})=>{
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width:device.width,height:device.height});
  await page.goto("/modern.html");
  await expect(page.locator("#overlay-title")).toBeVisible();
  await page.screenshot({path:"artifacts/screenshots/"+device.name+"-menu.png",fullPage:true});
  await page.locator("#play").click();
  await expect(page.locator("#overlay")).toBeHidden();
  await page.waitForTimeout(350);
  await page.screenshot({path:"artifacts/screenshots/"+device.name+"-game.png",fullPage:true});
  const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#screenshot").click()]);
  expect(download.suggestedFilename()).toMatch(/^mario-web-fase-1-.*\.png$/);
  await download.saveAs("artifacts/screenshots/"+device.name+"-export.png");
  expect(errors).toEqual([]);
 });
}
test("settings apply immediately without refresh",async({page})=>{
 await page.goto("/modern.html");await page.locator("#options").click();
 await expect(page.locator("#key-settings")).toBeVisible();
 const left=page.locator("#key-settings button").first();
 await left.click();await left.press("KeyJ");
 await expect(left).toHaveText("KeyJ");
 await page.locator("#play").click();
 await expect(page.locator("#key-settings")).toHaveCount(0);
});

test("classic homepage retains original sprites and starts",async({page})=>{
 await page.setViewportSize({width:1366,height:768});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");
 await expect(page.locator("#fase1")).toBeAttached();
 await expect(page.locator("#logo2 img")).toHaveAttribute("src","./img/logo.png");
 await page.screenshot({path:"artifacts/screenshots/classic-home.png",fullPage:false});
 await page.locator(".classic-start").click();
 await expect(page.locator("#home")).toBeHidden();
 await expect(page.locator("#player")).toBeVisible();
 await page.screenshot({path:"artifacts/screenshots/classic-game.png",fullPage:false});
 await page.locator("#classic-keys").click();
 await expect(page.locator("#keyConfig")).toBeVisible();
 await page.locator("#saveKeyReturn").click();
 expect(errors).toEqual([]);
});
