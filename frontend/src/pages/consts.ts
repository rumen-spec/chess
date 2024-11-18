export const BACKEND = 'ws://localhost:8080'


const scores = new Map<string, number>()

scores.set('P', 1);
scores.set('B', 3);
scores.set('N', 3);
scores.set('R', 5);
scores.set('Q', 9);

export default scores;
