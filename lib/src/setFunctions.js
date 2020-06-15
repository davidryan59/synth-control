// Helper functions for dealing with Javascript sets

export const printSet = (set) => {
  let text = '';
  for (const elem of set) {
    text += `, ${elem.toString()}`;
  }
  return text.slice(2);
};

export const setUnion = (setA, setB) => {
  const union = new Set(setA);
  for (const elem of setB) {
    union.add(elem);
  }
  return union;
};

export const setIntersection = (setA, setB) => {
  const intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
};
