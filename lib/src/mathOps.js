const mathOps = {}
mathOps['+'] = (a, b) => a + b
mathOps['*'] = (a, b) => a * b
mathOps['^'] = (a, b) => a ** b
mathOps['exp'] = (a, b) => b ** a
mathOps['log'] = (a, b) => Math.log(a) / Math.log(b)

export default mathOps
