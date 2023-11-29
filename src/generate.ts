import { generateHuesByStep, generateTonesByStep } from './utilities';
import { ColorPalette } from './ColorPalette';
import { ColorSequence, Hue } from './ColorSequence';
import { ViewingConditions } from '@material/material-color-utilities';

// const backgroundLstarStep = 10;
const backgroundLstar = 50;

// for (
//     let backgroundLstar = HctConstants.lstar.min;
//     backgroundLstar <= HctConstants.lstar.max;
//     backgroundLstar += backgroundLstarStep
// ) {
const colorPalette = new ColorPalette(generateHuesByStep(24), generateTonesByStep(2.5));
const grayCS = new ColorSequence(colorPalette, new Hue(0, 'gray'));
grayCS.chromaProgression.type = 'min';
colorPalette.colorSequences.push(grayCS);
colorPalette.defaultViewingConditions = ViewingConditions.make(
    undefined, // whitePoint, default = D65
    undefined, // adaptingLuminance, default = 11.72
    backgroundLstar,
    undefined, // surround, default = 2
    undefined // discountIlluminant, default = false
);

// Generate JSON, CSS, and ASE files
colorPalette.generateJson();
colorPalette.generateCss();
colorPalette.generateAse();

// console.log(
//     colorPalette.colorSequences[
//         colorPalette.colorSequences.length - 1
//     ].chromaProgression.progression?.get(50)
// );

// }
