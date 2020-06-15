export const mathsOps = {};
export const unaryOps = {};

// Binary maths operations
mathsOps['+'] = (a, b) => a + b;
mathsOps['*'] = (a, b) => a * b;
mathsOps['^'] = (a, b) => a ** b;
mathsOps['-'] = (a, b) => b - a;
mathsOps['/'] = (a, b) => b / a;
mathsOps.exp = (a, b) => b ** a;
mathsOps.log = (a, b) => Math.log(a) / Math.log(b);
mathsOps.max = (a, b) => Math.max(a, b);
mathsOps.min = (a, b) => Math.min(a, b);

// Unary maths operations
mathsOps.abs = (a) => Math.abs(a);
unaryOps.abs = true;
