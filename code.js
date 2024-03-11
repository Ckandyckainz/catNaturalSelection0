// Based on code2.js from catFamilyTree0

let mcan = document.getElementById("mcan");
mcan.width = window.innerWidth*0.95;
mcan.height = window.innerHeight*0.95;
let mctx = mcan.getContext("2d");

let backgroundColor = [Math.random(), Math.random(), Math.random()];
let mutationRate = 0.05;
let unusualFurColorRate = 0.1;

let cats = [];
let mice = [];
let catIdCounter = 0;
let mouseIdCounter = 0;
const near0 = 0.0000001;

function newNormalCatColor(){
    let r = Math.random();
    let g = Math.random()*r;
    let b = Math.random()*g;
    if (Math.random() < unusualFurColorRate) {
        r = Math.random();
        g = Math.random();
        b = Math.random();
    }
    return [r, g, b];
}

function floorArrayItems(array, m){
    for (let i=0; i<array.length; i++) {
        array[i] = Math.floor(array[i]*(m+1))/m;
    }
    return array;
}

function averageColors(c1, c2){
    let nc = [];
    for (let i=0; i<3; i++) {
        nc.push((c1[i]+c2[i])/2);
    }
    return nc;
}

let chromosomeFuncs = [
    [
        {
            // sex
            setPhenotype: (cat, alleles)=>{if (alleles[0] == "Y" || alleles[1] == "Y") {cat.sex = "male";}},
            random: ()=>{return "X"}
        }
    ],
    [
        {
            // main fur color
            setPhenotype: (cat, alleles)=>{cat.appearance.mc = averageColors(...alleles);},
            random: ()=>{
                let mc = newNormalCatColor();
                for (let i=0; i<3; i++) {
                    mc[i] = Math.floor(mc[i]*6)/4;
                    if (mc[i] > 1) {
                        mc[i] = 1;
                    }
                }
                return mc;
            }
        }
    ],
    [
        {
            // mouth color
            setPhenotype: (cat, alleles)=>{
                if (alleles[0] == "white" || alleles[1] == "white") {
                    cat.appearance.cc = [1, 1, 1];
                } else {
                    cat.appearance.cc = averageColors(...alleles);
                }
            },
            random: ()=>{
                if (Math.random() < 0.3) {
                    return "white";
                } else {
                    return floorArrayItems(newNormalCatColor(), 4);
                }
            }
        }
    ],
    [
        {
            // number of head fur tufts
            setPhenotype: (cat, alleles)=>{cat.appearance.tfts1 = Math.floor((alleles[0]+alleles[1])/2);},
            random: ()=>{return Math.floor(Math.random()*3)*2+5;}
        }
    ],
    [
        {
            // number of mouth fur tufts
            setPhenotype: (cat, alleles)=>{cat.appearance.tfts2 = Math.floor((alleles[0]+alleles[1])/2);},
            random: ()=>{return Math.floor(Math.random()*2)*2+5;}
        }
    ],
    [
        {
            // fur tuft length
            setPhenotype: (cat, alleles)=>{
                cat.appearance.tfts1l = (alleles[0]+alleles[1])/2;
                cat.appearance.tfts2l = (alleles[0]+alleles[1])/6;
            },
            random: ()=>{return Math.floor(Math.random()*3)/5+1.2;}
        }
    ],
    [
        {
            // fur tuft stretch
            setPhenotype: (cat, alleles)=>{
                cat.appearance.tfts1s = (alleles[0]+alleles[1])/2;
                cat.appearance.tfts2s = (alleles[0]+alleles[1])/2;
            },
            random: ()=>{return Math.floor(Math.random()*3)/6+0.75;}
        }
    ],
    [
        {
            // fur tuft sag
            setPhenotype: (cat, alleles)=>{
                cat.appearance.tftsSag = (alleles[0]+alleles[1])/10;
            },
            random: ()=>{return Math.floor(Math.random()*3)-1}
        }
    ],
    [
        {
            // ear angle
            setPhenotype: (cat, alleles)=>{
                cat.appearance.earAngle = Math.PI/4+Math.PI*(alleles[0]+alleles[1])/32;
            },
            random: ()=>{return Math.floor(Math.random()*3)-1;}
        }
    ],
    [
        {
            // ear length
            setPhenotype: (cat, alleles)=>{
                cat.appearance.earLength = (alleles[0]+alleles[1])/2;
            },
            random: ()=>{return Math.floor(Math.random()*3)/3+1.3;}
        }
    ],
    [
        {
            // ear width
            setPhenotype: (cat, alleles)=>{
                cat.appearance.earWidth = (alleles[0]+alleles[1])/2;
            },
            random: ()=>{return Math.floor(Math.random()*2)/10+0.5;}
        }
    ],
    [
        {
            // white fur or not
            setPhenotype: (cat, alleles)=>{
                if (alleles[0] == "white" && alleles[1] == "white") {
                    cat.appearance.mc = [1,1,1];
                    cat.appearance.cc = [1,1,1];
                }
            },
            random: ()=>{if (Math.random() < 0.2) {return "white";} else {return "normal";}}
        },
    ],
    [
        {
            // eye color
            setPhenotype: (cat, alleles)=>{
                let colors = [[1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0.5, 0], [0, 0, 1], 0, [0.5, 0, 1], [1, 1, 0.5], [0, 1, 1], 0, [0.75, 0.5, 1], 0, 0, 0, [1, 1, 1]];
                cat.appearance.ec = colors[alleles[0]+alleles[1]];
            },
            random: ()=>{
                let alleles = [0, 1, 3, 7]; // yellow, blue, purple, white
                return alleles[Math.floor(Math.random()*4)];
            }
        },
    ],
    [
        {
            // stripes
            setPhenotype: (cat, alleles)=>{
                if (Array.isArray(alleles[0]) && Array.isArray(alleles[1])) {
                    cat.appearance.stripes = {c: averageColors(alleles[0], alleles[1]), type: "M"};
                } else if (Array.isArray(alleles[0])) {
                    cat.appearance.stripes = {c: alleles[0], type: "M"};
                } else if (Array.isArray(alleles[1])) {
                    cat.appearance.stripes = {c: alleles[1], type: "M"};
                } else if (alleles[0] == "darker" || alleles[1] == "darker") {
                    let c = [];
                    for (let i=0; i<3; i++) {
                        c.push(cat.appearance.mc[i]/2);
                    }
                    cat.appearance.stripes = {c: c, type: "M"};
                }
            },
            random: ()=>{
                if (Math.random() < 0.5) {
                    return "none";
                } else if (Math.random() < 0.8) {
                    return "darker";
                } else {
                    return floorArrayItems(newNormalCatColor(), 4);
                }
            }
        }
    ],
    [
        {
            // stripes: M or N
            setPhenotype: (cat, alleles)=>{
                if (alleles[0] == "N" && alleles[1] == "N" && cat.appearance.stripes != false) {
                    cat.appearance.stripes.type = "N";
                }
            },
            random: ()=>{if (Math.random() < 0.3) {return "N";} else {return "M";}}
        }
    ],
    [
        {
            // patch pattern
            setPhenotype: (cat, alleles)=>{
                let ids = [];
                let tfts = cat.appearance.tfts1;
                for (let i=0; i<tfts; i++) {
                    let j = Math.floor(i*8/tfts);
                    if (alleles[0][j]+alleles[1][j] >= 1) {
                        ids.push(i);
                    }
                }
                cat.appearance.patches.ids = ids.slice();
            },
            random: ()=>{
                let ids = [];
                if (Math.random() < 0.6) {
                    for (let i=0; i<8; i++) {
                        ids.push(0);
                    }
                } else {
                    for (let i=0; i<8; i++) {
                        ids.push(Math.random() < 0.2);
                    }
                }
                return ids.slice();
            }
        } 
    ],
    [
        {
            // patch color
            setPhenotype: (cat, alleles)=>{cat.appearance.patches.c = averageColors(...alleles);},
            random: ()=>{return floorArrayItems(newNormalCatColor(), 4);}
        }
    ],
    [
        {
            // patch inner radius
            setPhenotype: (cat, alleles)=>{cat.appearance.patches.ir = (alleles[0]+alleles[1])/2;},
            random: ()=>{return Math.floor(Math.random()*2)*0.7+0.3;}
        }
    ]
];

class CatAppearance{
	constructor(mc, lc, ec, ec2, nc, cc, clc, tlknc, tfts1, tfts1l, tfts1s, tfts2, tfts2l, tfts2s, tftsSag, earAngle, earWidth, earLength, stripes, patches, mouthColoring, pawColoring, scars, textColor, textOutlineColor){
  	this.mc = mc;
    this.lc = lc;
    this.ec = ec;
    this.ec2 = ec2;
    this.nc = nc;
    this.cc = cc;
    this.clc = clc;
    this.tlknc = tlknc;
    this.tfts1 = tfts1;
    this.tfts1l = tfts1l;
    this.tfts1s = tfts1s;
    this.tfts2 = tfts2;
    this.tfts2l = tfts2l;
    this.tfts2s = tfts2s;
    this.tftsSag = tftsSag;
    this.earAngle = earAngle;
    this.earWidth = earWidth;
    this.earLength = earLength;
    this.stripes = stripes;
    this.patches = patches;
    this.mouthColoring = mouthColoring;
    this.pawColoring = pawColoring;
    this.scars = scars;
    this.textColor = textColor;
    this.textOutlineColor = textOutlineColor;
  }
  randomize(){
    this.mc = randomFurColor();
    this.lc = [0, 0, 0];
    this.ec = [Math.random(), Math.random(), Math.random()];
    this.ec2 = randomFurColor();
    this.nc = randomFurColor();
    this.cc = randomFurColor();
    this.clc = [0, 0, 0];
    this.tlknc = randomFurColor();
    this.tfts1 = Math.floor(Math.random()*5+5);
    this.tfts1l = Math.random()*0.6+1.1;
    this.tfts1s = Math.random()*0.4+0.7;
    this.tfts2 = Math.floor(Math.random()*6+3);
    this.tfts2l = Math.random()*0.3+0.45;
    this.tfts2s = Math.random()*0.4+0.7;
    this.tftsSag = Math.random()*0.3-0.15;
    this.earAngle = Math.PI*(Math.random()*0.16+0.17);
    this.earWidth = Math.PI*(Math.random()*0.08+0.12);
    this.earLength = Math.random()*0.6+1.4;
    this.stripes = false;
    this.patches = {c: [], ids: [], ir: 0.5};
    this.mouthColoring = randomFurColor();
    this.pawColoring = randomFurColor();
    this.scars = false;
    this.textColor = randomFurColor();
    this.textOutlineColor = randomFurColor();
  }
}

function randomFurColor(){
    let r = Math.random();
    let g = Math.random()*r;
    let b = Math.random()*g;
    return [r, g, b];
}

function colorString(r, g, b, a){
	let color = Math.floor(r*255)*256**3+Math.floor(g*255)*256**2+Math.floor(b*255)*256+Math.floor(a*255);
  return "#"+color.toString(16).padStart(8, "0");
}

function v(value){
    if (Array.isArray(value)) {
//      return new KeyFramedValue(value);
    } else {
      return {v: value};
    }
}

function drawEye(ctx, catHead, ex, ey, r, id){
    let xe = ex+catHead.eyes.x.v*r/8;
    let ye = ey+catHead.eyes.y.v*r/8;
    let r1 = r*0.3*catHead.eyes.w.v;
    let r2 = r*0.23*catHead.eyes.h.v;
    let px = ex+catHead.pupils.x.v*r/8;
    let py = ey+catHead.pupils.y.v*r/8;
    let gradient = ctx.createRadialGradient(px, py, 0, px, py, r2);
    gradient.addColorStop(0, colorString(...catHead.cata.ec, 1));
    let gec = [];
    for (let j=0; j<3; j++) {
      gec.push(catHead.cata.ec[j]*(1-catHead.ec.v)+catHead.cata.ec2[j]*catHead.ec.v);
    }
    gradient.addColorStop(1, colorString(...gec, 1));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(xe, ye, r1, r2, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "#000000FF";
    ctx.beginPath();
    ctx.ellipse(px, py, r*0.12*catHead.pupils.w.v, r*0.19*catHead.pupils.h.v, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = colorString(...catHead.cata.tlknc, catHead.innerPupils.a.v);
    ctx.beginPath();
    ctx.ellipse(px, py, r*0.12*catHead.pupils.w.v*catHead.innerPupils.m.v, r*0.19*catHead.pupils.h.v*catHead.innerPupils.m.v, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = colorString(...catHead.cata.mc, 1);
    for (let j=0; j<2; j++) {
      ctx.beginPath();
      let a1 = (Math.PI*catHead.eyelids[j*2].v)%(Math.PI*2);
      let a2 = (Math.PI*catHead.eyelids[j*2+1].v)%(Math.PI*2);
      let a3 = a1;
      let a4 = a2;
      if (id == 1) {
        a3 = Math.PI*3-a2;
        a4 = Math.PI*3-a1;
      }
      ctx.ellipse(xe, ye, r1+1, r2+1, 0, a3, a4, false);
      ctx.fill();
    }
}

class CatHeadFront{
  constructor(cata, x, y, r, lr, ud, smile, mouthOpen, eyesX, eyesY, eyesW, eyesH, pupilsX, pupilsY, pupilsW, pupilsH, eyelids, innerPupilsM, innerPupilsA, ec){
    this.cata = cata;
    this.x = v(x);
    this.y = v(y);
    this.r = v(r);
    this.smile = v(smile);
    this.mouthOpen = v(mouthOpen);
    this.eyes = {x: v(eyesX), y: v(eyesY), w: v(eyesW), h: v(eyesH)};
    this.pupils = {x: v(pupilsX), y: v(pupilsY), w: v(pupilsW), h: v(pupilsH)};
    this.eyelids = [];
    eyelids.forEach((item)=>{
      this.eyelids.push(v(item));
    });
    this.innerPupils = {m: v(innerPupilsM), a: v(innerPupilsA)};
    this.ec = v(ec);
    this.headAngle = {lr: v(lr), ud: v(ud)};
  }
  drawSelf(ctx, cw){
    let x = this.x.v*cw;
    let y = this.y.v*cw;
    let r = this.r.v*cw;
  	let nx = x+this.headAngle.lr.v*r/2;
    let ny = y+this.headAngle.ud.v*r/2;
	ctx.fillStyle = colorString(...this.cata.mc, 1);
    ctx.strokeStyle = colorString(...this.cata.lc, 1);
    ctx.lineWidth = r/10;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		ctx.fill();
    if (this.cata.stripes != false) {
        ctx.strokeStyle = colorString(...this.cata.stripes.c, 1);
        ctx.beginPath();
        ctx.moveTo(nx-r*0.35, ny-r*0.4);
        ctx.lineTo(nx-r*0.2, ny-r*0.65);
        ctx.lineTo(nx-r*0, ny-r*0.4);
        ctx.lineTo(nx-r*-0.2, ny-r*0.65);
    	if (this.cata.stripes.type != "N") {
      	    ctx.lineTo(nx-r*-0.35, ny-r*0.4);
        }
        ctx.stroke();
        ctx.strokeStyle = colorString(...this.cata.lc, 1);
    }
    for (let i=0; i<this.cata.tfts1; i++) {
      let isPatch = false;
      if (this.cata.patches != false) {
        ctx.fillStyle = colorString(...this.cata.mc, 1);
        this.cata.patches.ids.forEach((id)=>{
          if (id == i) {
            isPatch = true;
            ctx.fillStyle = colorString(...this.cata.patches.c, 1);
          }
        });
      }
    	ctx.beginPath();
      let a = Math.PI/-2+Math.PI*2*i/this.cata.tfts1;
      let px1 = x+Math.cos(a)*r;
      let py1 = y+Math.sin(a)*r;
      ctx.moveTo(px1, py1);
      let a2 = Math.PI/-2+Math.PI*2*(i+0.5)/this.cata.tfts1;
      let as = Math.sign(a2-Math.PI/2);
      let px = x+Math.cos(a2)*r*this.cata.tfts1l-this.headAngle.lr.v*r/8;
      let py = y+Math.sin(a2)*r*this.cata.tfts1l*this.cata.tfts1s-this.headAngle.ud.v*r/8-this.cata.tftsSag*r;
      ctx.lineTo(px, py);
      a = Math.PI/-2+Math.PI*2*(i+1)/this.cata.tfts1;
      let px2 = x+Math.cos(a)*r;
      let py2 = y+Math.sin(a)*r;
      ctx.lineTo(px2, py2);
      if (isPatch) {
        ctx.lineTo(nx+Math.cos(a2)*this.cata.patches.ir*r, ny+Math.sin(a2)*this.cata.patches.ir*r);
      }
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px, py);
      ctx.lineTo(px2, py2);
      ctx.stroke();
      if (this.cata.stripes != false) {
      	ctx.strokeStyle = colorString(...this.cata.stripes.c, 1);
        ctx.beginPath();
        ctx.moveTo(px+as*r/8, py);
        ctx.lineTo(nx+Math.cos(a2)*r*0.8, (py+ny+Math.sin(a2)*r*0.8)/2);
        ctx.stroke();
        ctx.strokeStyle = colorString(...this.cata.lc, 1);
      }
    }
    for (let i=0; i<2; i++) {
    	ctx.fillStyle = colorString(...this.cata.mc, 1);
    	ctx.lineWidth = r/10;
      ctx.beginPath();
      let ea = Math.PI/-2+this.cata.earAngle*(i*2-1);
      let a = ea-this.cata.earWidth;
      ctx.moveTo(x+Math.cos(a)*r*0.9, y+Math.sin(a)*r*0.9);
      ctx.lineTo(x+Math.cos(ea)*r*this.cata.earLength+this.headAngle.lr.v*r/4, y+Math.sin(ea)*r*this.cata.earLength+this.headAngle.ud.v*r/8);
      a = ea+this.cata.earWidth;
      ctx.lineTo(x+Math.cos(a)*r*0.9, y+Math.sin(a)*r*0.9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FF88FFFF";
      ctx.beginPath();
      a = ea-this.cata.earWidth*0.58;
      ctx.moveTo(x+Math.cos(a)*r*0.85, y+Math.sin(a)*r*0.85);
      ctx.lineTo(x+Math.cos(ea)*r*this.cata.earLength*0.82+this.headAngle.lr.v*r/4, y+Math.sin(ea)*r*this.cata.earLength*0.82+this.headAngle.ud.v*r/8);
      a = ea+this.cata.earWidth*0.58;
      ctx.lineTo(x+Math.cos(a)*r*0.85, y+Math.sin(a)*r*0.85);
      ctx.fill();
    }
    if (this.cata.mouthColoring) {
      ctx.fillStyle = colorString(...this.cata.cc, 1);
      ctx.strokeStyle = colorString(...this.cata.clc, 1);
    } else {
      ctx.fillStyle = colorString(...this.cata.mc, 1);
      ctx.strokeStyle = colorString(...this.cata.lc, 1);
    }
   	ctx.beginPath();
		ctx.arc(nx, ny+r*0.47, r*0.4, 0, 2*Math.PI);
		ctx.fill();
    for (let i=0; i<this.cata.tfts2; i++) {
      if (this.cata.mouthColoring) {
        ctx.fillStyle = colorString(...this.cata.cc, 1);
        ctx.strokeStyle = colorString(...this.cata.clc, 1);
      } else {
        ctx.fillStyle = colorString(...this.cata.mc, 1);
        ctx.strokeStyle = colorString(...this.cata.lc, 1);
      }
      let isPatch = false;
      if (this.cata.patches != false) {
        this.cata.patches.ids.forEach((id)=>{
          if (id == i+this.cata.tfts1) {
            isPatch = true;
            ctx.fillStyle = colorString(...this.cata.patches.c, 1);
          }
        });
      }
      ctx.lineWidth = r/15;
    	ctx.beginPath();
      let a = Math.PI/-4+Math.PI*1.5*i/this.cata.tfts2;
      let px1 = nx+Math.cos(a)*r*0.4;
      let py1 = ny+r*0.47+Math.sin(a)*r*0.4;
      ctx.moveTo(px1, py1);
      let a2 = Math.PI/-4+Math.PI*1.5*(i+0.5)/this.cata.tfts2;
      let px = nx+Math.cos(a2)*r*this.cata.tfts2l-this.headAngle.lr.v*r/8;
      let py = ny+r*0.47+Math.sin(a2)*r*this.cata.tfts2l*this.cata.tfts2s-this.headAngle.ud.v*r/8-this.cata.tftsSag*r/2;
      ctx.lineTo(px, py);
      a = Math.PI/-4+Math.PI*1.5*(i+1)/this.cata.tfts2;
      let px2 = nx+Math.cos(a)*r*0.4;
      let py2 = ny+r*0.47+Math.sin(a)*r*0.4;
      ctx.lineTo(px2, py2);
      if (isPatch) {
        ctx.lineTo(nx, ny+r*0.47);
      }
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px, py);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    }
    ctx.fillStyle = colorString(...this.cata.lc, 1);
    ctx.beginPath();
    ctx.moveTo(nx-r*0.2, ny+r*0.17);
    ctx.lineTo(nx+r*0.2, ny+r*0.17);
    ctx.lineTo(nx, ny+r*0.47);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(nx, ny+r*0.665-(this.smile.v+this.mouthOpen.v/2)*r/8, r/4, Math.abs(this.smile.v)*r/8, 0, Math.PI*(Math.sign(this.smile.v)+3)/2, Math.PI*(Math.sign(this.smile.v)+5)/2);
    ctx.stroke();
    if (this.mouthOpen.v != 0) {
      ctx.beginPath();
      ctx.ellipse(nx, ny+r*0.665-(this.smile.v-this.mouthOpen.v)*r/8, r/5, Math.abs(this.smile.v)*r/10, 0, Math.PI*(Math.sign(this.smile.v)+3)/2, Math.PI*(Math.sign(this.smile.v)+5)/2);
      ctx.stroke();
    }
    ctx.lineWidth = r/25;
    ctx.beginPath();
    ctx.moveTo(nx, ny+r*0.43);
    ctx.lineTo(nx, ny+r*0.55+r/8-this.mouthOpen.v*r/16);
    ctx.stroke();
    for (let i=0; i<this.cata.scars.length/5; i++) {
      ctx.strokeStyle = colorString(this.cata.scars[i*5+5], 0, 0, 1);
      ctx.lineWidth = this.cata.scars[i*5]*r/8;
      ctx.beginPath();
      ctx.moveTo(nx+r*this.cata.scars[i*5+1], ny+r*this.cata.scars[i*5+2]);
      ctx.lineTo(nx+r*this.cata.scars[i*5+3], ny+r*this.cata.scars[i*5+4]);
      ctx.stroke();
    }
    for (let i=0; i<2; i++) {
        drawEye(ctx, this, nx-r*0.4+i*r*0.8, ny-r*0.1, r, i);
    }
	}
}

class Cat{
    constructor(parents){
        cats.push(this);
        this.direction = Math.random()*Math.PI*2;
        this.miceEaten = 0;
        this.age = 1;
        this.id = catIdCounter;
        catIdCounter ++;
        this.chromosomes = [];
        this.sex = "female";
        this.parents = [];
        this.siblings = [];
        this.familyNames = [];
        this.appearance = new CatAppearance();
        this.appearance.randomize();
        if (parents != undefined) {
            for (let i=0; i<chromosomeFuncs.length*2; i+=2) {
                parents.forEach((parent)=>{
                    if (Math.random() < mutationRate) {
                        this.chromosomes.push([chromosomeFuncs[i/2][0].random(this)]);
                    } else {
                        this.chromosomes.push(parent.chromosomes[i+Math.floor(Math.random()*2)]);
                    }
                });
            }
            updatePhenotypes(this);
            parents[0].kittens.forEach((sibling)=>{
                this.siblings.push(sibling);
                sibling.siblings.push(this);
            });
            if (Math.random() < 0.5) {
                this.parents = parents.slice();
            } else {
                this.parents[0] = parents[1];
                this.parents[1] = parents[0];
            }
            this.parents.forEach((parent)=>{
                this.familyNames.push(parent.familyNames[Math.floor(Math.random()*2)]);
                parent.kittens.push(this);
            });
        } else {
            this.familyNames.push(newFamilyName());
            this.familyNames.push(newFamilyName());
            for (let i=0; i<chromosomeFuncs.length; i++) {
                for (let j=0; j<2; j++) {
                    let chromosome = [];
                    for (let k=0; k<chromosomeFuncs[i].length; k++) {
                        chromosome.push(chromosomeFuncs[i][k].random(this));
                    }
                    this.chromosomes.push(chromosome);
                }
            }
            updatePhenotypes(this);
        }
        this.individualName = newIndividualName();
        this.identifierSylable = capitalize(randomLetter())+randomVowel();
        this.formalFullName = this.individualName+" "+this.familyNames.join(" ")+" "+this.identifierSylable;
        this.formalName = this.identifierSylable+decapitalize(this.individualName);
        this.partner;
        this.kittens = [];
        this.hearingDistSquared = (this.appearance.earAngle*this.appearance.earWidth*300)**2;
        this.mouseSeeDistSquared = 0;
        for (let i=0; i<3; i++) {
            this.mouseSeeDistSquared += Math.abs(this.appearance.mc[i]-backgroundColor[i]);
        }
        this.mouseSeeDistSquared *= 70;
        this.mouseSeeDistSquared **= 2;
        return this;
    }
}

function updatePhenotypes(cat){
    for (let i=0; i<chromosomeFuncs.length; i++) {
        for (let j=0; j<chromosomeFuncs[i].length; j++) {
            chromosomeFuncs[i][j].setPhenotype(cat, [cat.chromosomes[i*2][j], cat.chromosomes[i*2+1][j]]);
        }
    }
}

class FamilyTreeChunk{
    constructor(parent1, parent2, kittens){
        this.catPoss = [];
        this.isChunk = true;
        prepctx.fillStyle = "gray";
        prepctx.fillRect(0, 0, prepcan.width, prepcan.height);
        let x = 70;
        let stemXs = [];
        for (let i=0; i<kittens.length; i++) {
            let kitten = kittens[i];
            let stemX = x;
            if (kitten.isChunk) {
                for (let i=0; i<kitten.catPoss.length; i+=3) {
                    this.catPoss.push(kitten.catPoss[i]);
                    this.catPoss.push(kitten.catPoss[i+1]+x);
                    this.catPoss.push(kitten.catPoss[i+2]+160);
                }
                prepctx.putImageData(kitten.imgdt, x, 160);
                x += kitten.imgdt.width;
                stemX += kitten.stemX;
            } else {
                this.catPoss.push(kitten, x, 230);
                let face = new CatHeadFront(kitten.appearance, x/1000, 0.23, 0.03, 0, 0, 0.1, 0, 0, 0, 1, 1, 0, 0, 1, 1, [0, 0, 0, 0], 0, 0, 0);
                face.drawSelf(prepctx, 1000);
                x += 140;
                if (i == kittens.length-1) {
                    x -= 70;
                }
            }
            stemXs.push(stemX);
        }
        this.stemX = (stemXs[0]+stemXs[stemXs.length-1])/2-70;
        if (kittens.length < 2) {
            this.stemX = 70;
        }
        prepctx.strokeStyle = "black";
        prepctx.lineWidth = 3;
        prepctx.beginPath();
        stemXs.forEach((stemX)=>{
            prepctx.moveTo(stemX, 150);
            prepctx.lineTo(stemX, 185);
        });
        if (kittens.length >= 2) {
            prepctx.moveTo(stemXs[0], 150);
            prepctx.lineTo(stemXs[stemXs.length-1], 150);
            prepctx.moveTo(this.stemX+70, 70);
            prepctx.lineTo(this.stemX+70, 150);
        }
        prepctx.stroke();
        let face = new CatHeadFront(parent1.appearance, this.stemX/1000, 0.07, 0.03, 0, 0, 0.1, 0, 0, 0, 1, 1, 0, 0, 1, 1, [0, 0, 0, 0], 0, 0, 0);
        face.drawSelf(prepctx, 1000);
        this.catPoss.push(parent1, this.stemX, 70);
        if (parent2 != "none") {
            prepctx.strokeStyle = "black";
            prepctx.lineWidth = 4;
            prepctx.beginPath();
            prepctx.moveTo(this.stemX+45, 70);
            prepctx.lineTo(this.stemX+95, 70);
            prepctx.stroke();
            face = new CatHeadFront(parent2.appearance, (this.stemX+140)/1000, 0.07, 0.03, 0, 0, 0.1, 0, 0, 0, 1, 1, 0, 0, 1, 1, [0, 0, 0, 0], 0, 0, 0);
            face.drawSelf(prepctx, 1000);
            this.catPoss.push(parent2, this.stemX+140, 70);
            if (kittens.length < 2) {
                this.imgdt = prepctx.getImageData(0, 0, 315, prepcan.height);
            } else {
                this.imgdt = prepctx.getImageData(0, 0, x, prepcan.height);
            }
        } else {
            this.imgdt = prepctx.getImageData(0, 0, 175, prepcan.height);
        }
    }
}

function drawCatFace(ctx, cw, cat, x, y, name, r){
    let face = new CatHeadFront(cat.appearance, x/cw, y/cw, r, 0, 0, 0.1, 0, 0, 0, 1, 1, 0, 0, 1, 1, [0, 0, 0, 0], 0, 0, 0);
    face.drawSelf(ctx, cw);
    if (name) {
        // https://www.w3schools.com/graphics/canvas_text.asp
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(cat.formalName, x, y+65);
    }
}

function newIndividualName(){
    if (Math.random() < 0.5) {
        let firstLetters = ["H'l", "H'l", "H", "L", "Sh"];
        let firstLetter = firstLetters[Math.floor(Math.random()*5)];
        let ending = "eyn";
        if (Math.random() < 0.2) {
            ending = "éyne";
        }
        if (firstLetter == "H'l") {
            if (Math.random() < 0.65) {
                ending = ending.replace("n", "m");
            }
        } else if (Math.random() < 0.4) {
            ending = ending.replace("n", "m");
        }
        return firstLetter+ending;
    } else if (Math.random() < 0.65) {
        let firstLetters = ["H", "H", "H", "L", "K", "C", "Kw", "Sh"];
        let firstLetter = firstLetters[Math.floor(Math.random()*8)];
        if (Math.random() < 0.09) {
            firstLetter = "H'l";
        } else if (Math.random() < 0.05) {
            firstLetter = "R";
        }
        return firstLetter+"ete";
    } else if (Math.random() < 1/4) {
        if (Math.random() < 0.5) {
            return "H'lam";
        } else {
            return "H'lan";
        }
    } else if (Math.random() < 0.5) {
        let names = ["Shey", "Hey", "Kem", "Ken", "Shen", "Shem", "Sher"];
        return names[Math.floor(Math.random()*7)];
    } else if (Math.random() < 0.2) {
        return "Lint";
    } else {
        let name = "";
        for (let i=0; i<Math.random()*3; i++) {
            name += randomLetter()+randomVowel();
        }
        if (Math.random() < 0.1) {
            name += randomLetter();
        }
        return capitalize(name);
    }
}

function newFamilyName(){
    if (Math.random() < 0.09) {
        let names = ["Curow", "Kurow", "Kwurow"];
        return names[Math.floor(Math.random()*3)];
    } else if (Math.random() < 0.07) {
        let names = ["Mukem", "Muren", "Zetteyl", "Aleyr"];
        return names[Math.floor(Math.random()*4)];
    } else if (Math.random() < 1/2) {
        let endings = ["em", "ow"];
        let ending = endings[Math.floor(Math.random()*2)];
        return capitalize(randomLetter())+"u"+randomLetter()+ending;
    } else if (Math.random() < 2/3) {
        return capitalize(randomLetter())+randomVowel()+randomLetter()+randomVowel()+randomLetter();
    } else {
        let name = "";
        for (let i=0; i<Math.random()*4; i++) {
            name += randomLetter()+randomVowel();
        }
        if (Math.random() < 0.3) {
            name += randomLetter();
        }
        return capitalize(name);
    }
}

function randomLetter(){
    if (Math.random() < 0.95) {
        let letters = ["h", "l", "c", "cr", "k", "kw", "n", "m", "sh", "r"];
        return letters[Math.floor(Math.random()*10)];
    } else if (Math.random() < 0.99) {
        let letters = ["z", "w", "tt"];
        return letters[Math.floor(Math.random()*3)];
    } else {
        return "g";
    }
}

function randomVowel(){
    if (Math.random() > 0.8) {
        let vowels = ["u", "a", "e", "ey"];
        return vowels[Math.floor(Math.random()*4)];
    } else {
        let vowels = ["ow", "o", "y", "i"];
        return vowels[Math.floor(Math.random()*4)];
    }
}

function capitalize(word){
    return word[0].toUpperCase()+word.substring(1, word.length);
}

function decapitalize(word){
    return word[0].toLowerCase()+word.substring(1, word.length);
}

function confineRange(value, min, max){
    if (value > max) {
        return max;
    } else if (value < min) {
        return min;
    } else {
        return value;
    }
}

class Mouse{
    constructor(){
        this.id = mouseIdCounter;
        mouseIdCounter ++;
        mice.push(this);
    }
    drawSelf(ctx, r){
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.pos.x, this.pos.y, r, r);
    }
}

let catPoss = [];
let mousePoss = [];
let timeCounter = 0;
let framesSinceLastBackgroundSwitch = 0;

mctx.fillStyle = colorString(backgroundColor);
mctx.fillRect(0, 0, mcan.width, mcan.height);

for (let i=0; i<20; i++) {
    let cat = new Cat();
    let pos = placeCat(mcan, 80);
    cat.pos = pos;
}

mouseSetup();

huntingLoop();

function catSetup(){
    catPoss = [];
    let newCats = [];
    while (cats.length > 0){
        let index = Math.floor(Math.random()*cats.length);
        newCats.push(cats[index]);
        cats.splice(index, 1);
    }
    cats = newCats.slice();
    let parentsLength = Math.floor(cats.length/2);
    for (let i=0; i<parentsLength; i++) {
        for (let j=0; j<Math.random()*3+1; j++) {
            new Cat([cats[i*2], cats[i*2+1]]);
        }
    }
    cats.forEach((cat)=>{
        let pos = placeCat(mcan, 80);
        cat.pos = pos;
    });
}

function mouseSetup(){
    mousePoss = [];
    mice = [];
    for (let i=0; i<40; i++) {
        let mouse = new Mouse();
        let pos = placeMouse(mcan, 25, 80);
        mouse.pos = pos;
        mouse.drawSelf(mctx, 10);
    }
}

function placeCat(can, dist){
    let pos = {x: Math.random()*(can.width-dist)+dist/2, y: Math.random()*(can.height-dist)+dist/2};
    let distSquared = dist**2;
    for (let i=0; i<20; i++) {
        catPoss.forEach((catPos)=>{
            if ((pos.x-catPos.x)**2+(pos.y-catPos.y)**2 < distSquared) {
                pos = {x: Math.random()*(can.width-dist)+dist/2, y: Math.random()*(can.height-dist)+dist/2};
            }
        });
    }
    catPoss.push(pos);
    return pos;
}

function placeMouse(can, mouseDist, catDist){
    let pos = {x: Math.random()*(can.width-mouseDist)+mouseDist/2, y: Math.random()*(can.height-mouseDist)+mouseDist/2};
    let catDistSquared = catDist**2;
    let mouseDistSquared = mouseDist**2;
    for (let i=0; i<20; i++) {
        mousePoss.forEach((mousePos)=>{
            if ((pos.x-mousePos.x)**2+(pos.y-mousePos.y)**2 < mouseDistSquared) {
                pos = {x: Math.random()*(can.width-mouseDist)+mouseDist/2, y: Math.random()*(can.height-mouseDist)+mouseDist/2};
            }
        });
        catPoss.forEach((catPos)=>{
            if ((pos.x-catPos.x)**2+(pos.y-catPos.y)**2 < catDistSquared) {
                pos = {x: Math.random()*(can.width-mouseDist)+mouseDist/2, y: Math.random()*(can.height-mouseDist)+mouseDist/2};
            }
        });
    }
    mousePoss.push(pos);
    return pos;
}

function getDistSquared(pos1, pos2){
    return (pos1.x-pos2.x)**2+(pos1.y-pos2.y)**2;
}

function getAngle(pos1, pos2){
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    return Math.atan2(pos2.y-pos1.y, pos2.x-pos1.x);
}

function sortArray(array){
    let arrayCopy = array.slice();
    let newArray = [];
    // https://radian628.github.io/blog/pages/js-weirdness-explained.html
    while (arrayCopy.length > 0) {
        item = Math.min(...arrayCopy);
        for (let i=0; i<arrayCopy.length; i++) {
            if (arrayCopy[i] == item) {
                arrayCopy.splice(i, 1);
                i = arrayCopy.length;
            }
        }
        newArray.push(item);
    }
    return newArray;
}

function boundedAdd(a, b, min, max){
    a += b;
    if (a < min) {
        a = min;
    } else if (a > max) {
        a = max;
    }
    return a;
}

function huntingLoop(){
    if (framesSinceLastBackgroundSwitch > 3000 && Math.random() < 1/4000) {
        backgroundColor = [Math.random(), Math.random(), Math.random()];
    }
    timeCounter ++;
    framesSinceLastBackgroundSwitch ++;
    mctx.fillStyle = colorString(...backgroundColor, 1);
    mctx.fillRect(0, 0, mcan.width, mcan.height);
    cats.forEach((cat)=>{
        if (cat.mouseHunting == undefined) {
            if (cat.miceEaten < 4) {
                let closestMouse;
                let closestMouseDist = Infinity;
                mice.forEach((mouse)=>{
                    let dist = getDistSquared(mouse.pos, cat.pos);
                    if (dist <= cat.hearingDistSquared && dist < closestMouseDist) {
                        closestMouse = mouse;
                        closestMouseDist = dist;
                    }
                });
                cat.mouseHunting = closestMouse;
                if (cat.mouseHunting == undefined) {
                    if (Math.random() < 1/120) {
                        cat.direction = Math.random()*Math.PI*2;
                    }
                    cat.pos.x = boundedAdd(cat.pos.x, Math.cos(cat.direction), 30, mcan.width-30);
                    cat.pos.y = boundedAdd(cat.pos.y, Math.sin(cat.direction), 30, mcan.height-30);
                }
            }
        } else if (getDistSquared(cat.mouseHunting.pos, cat.pos) > cat.hearingDistSquared) {
            cat.mouseHunting = undefined;
        } else if (getDistSquared(cat.mouseHunting.pos, cat.pos) <= 900) {
            for (let i=0; i<mice.length; i++) {
                if (mice[i].id == cat.mouseHunting.id) {
                    mice.splice(i, 1);
                }
            }
            cat.mouseHunting.pos = {x: Infinity, y: Infinity};
            cat.miceEaten ++;
            cat.mouseHunting = undefined;
        } else {
            let angle = getAngle(cat.pos, cat.mouseHunting.pos);
            cat.pos.x = boundedAdd(cat.pos.x, Math.cos(angle), 30, mcan.width-30);
            cat.pos.y = boundedAdd(cat.pos.y, Math.sin(angle), 30, mcan.height-30);
        }
        drawCatFace(mctx, mcan.height, cat, cat.pos.x, cat.pos.y, false, 0.03);
    });
    mice.forEach((mouse)=>{
        let anglesToAvoid = [];
        cats.forEach((cat)=>{
            if (getDistSquared(cat.pos, mouse.pos) <= cat.mouseSeeDistSquared) {
                anglesToAvoid.push(getAngle(mouse.pos, cat.pos));
            }
        });
        anglesToAvoid = sortArray(anglesToAvoid);
        if (anglesToAvoid.length > 0) {
            let biggestDiff = 0;
            let escapeAngle = 0;
            for (let i=0; i<anglesToAvoid.length-1; i++) {
                let currentDiff = anglesToAvoid[i+1]-anglesToAvoid[i];
                if (currentDiff > biggestDiff) {
                    biggestDiff = currentDiff;
                    escapeAngle = anglesToAvoid[i]+currentDiff/2;
                }
            }
            let currentDiff = Math.PI*2-anglesToAvoid[anglesToAvoid.length-1]+anglesToAvoid[0];
            if (currentDiff > biggestDiff) {
                escapeAngle = (anglesToAvoid[anglesToAvoid.length-1]+currentDiff/2+Math.PI)%(Math.PI*2)-Math.PI;
            }
            mouse.pos.x = boundedAdd(mouse.pos.x, Math.cos(escapeAngle)*.9, 30, mcan.width-30);
            mouse.pos.y = boundedAdd(mouse.pos.y, Math.sin(escapeAngle)*.9, 30, mcan.height-30);
        }
        mouse.drawSelf(mctx, 10);
    });
    if (mice.length > 0 && timeCounter < 1800) {
        requestAnimationFrame(huntingLoop);
    } else {
        timeCounter = 0;
        for (let i=0; i<cats.length; i++) {
            if (cats[i].miceEaten < 2 || cats[i].age > 4) {
                cats.splice(i, 1);
                i --;
            } else {
                cats[i].miceEaten = 0;
                cats[i].age ++;
            }
        }
        setTimeout(deathFadeLoop, 1000);
    }
}

function deathFadeLoop(){
    timeCounter ++;
    mctx.fillStyle = colorString(...backgroundColor, 1/32);
    mctx.fillRect(0, 0, mcan.width, mcan.height);
    cats.forEach((cat)=>{
        drawCatFace(mctx, mcan.height, cat, cat.pos.x, cat.pos.y, false, 0.03);
    });
    if (timeCounter < 300) {
        requestAnimationFrame(deathFadeLoop);
    } else {
        catSetup();
        mouseSetup();
        timeCounter = 0;
        huntingLoop();
    }
}