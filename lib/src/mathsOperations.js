export const mathOps = {};
export const unaryOps = {};

// Binary maths operations
mathOps['+'] = (a, b) => a + b;
mathOps['*'] = (a, b) => a * b;
mathOps['^'] = (a, b) => a ** b;
mathOps['-'] = (a, b) => b - a;
mathOps['/'] = (a, b) => b / a;
mathOps.exp = (a, b) => b ** a;
mathOps.log = (a, b) => Math.log(a) / Math.log(b);
mathOps.max = (a, b) => Math.max(a, b);
mathOps.min = (a, b) => Math.min(a, b);

// Unary maths operations
mathOps.abs = (a) => Math.abs(a);
unaryOps.abs = true;
