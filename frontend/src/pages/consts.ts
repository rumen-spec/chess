export const BACKEND = 'ws://chess-u5c0.onrender.com'


const scores = new Map<string, number>()

scores.set('P', 1);
scores.set('B', 3);
scores.set('N', 3);
scores.set('R', 5);
scores.set('Q', 9);

export default scores;
