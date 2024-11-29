import wP from "../../images/wP.png"
import wR from "../../images/wR.png"
import wQ from "../../images/wQ.png"
import wN from "../../images/wN.png"
import wB from "../../images/wB.png"
import wK from "../../images/wK.png"
import bP from "../../images/bP.png"
import bR from "../../images/bR.png"
import bQ from "../../images/bQ.png"
import bN from "../../images/bN.png"
import bB from "../../images/bB.png"
import bK from "../../images/bK.png"
export const BACKEND = 'wss://chess-u5c0.onrender.com'

const images = new Map<string, string>()
const scores = new Map<string, number>()

scores.set(wP, 1);
scores.set(bP, 1);
scores.set(wN, 3);
scores.set(bN, 3);
scores.set(wB, 3);
scores.set(bB, 3);
scores.set(wR, 5);
scores.set(bR, 5);
scores.set(wQ, 9);
scores.set(bQ, 9);



images.set('wP', wP)
images.set('wR', wR)
images.set('wK', wK)
images.set('wQ', wQ)
images.set('wN', wN)
images.set('wB', wB)
images.set('bP', bP)
images.set('bR', bR)
images.set('bK', bK)
images.set('bQ', bQ)
images.set('bN', bN)
images.set('bB', bB)

const resources = {images,scores}
export default resources;
