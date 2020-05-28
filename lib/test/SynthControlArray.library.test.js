import SynthControlArray from '../src/SynthControlArray';

const library = {
  label01: {
    level: 1,
    contents: [
      { param: 'freq', duration: 8, value: 240 },
      { param: 'freq', duration: 4, value: 270 },
      { param: 'freq', duration: 12, value: 300 },
    ],
  },
  label02: {
    level: 2,
    contents: [
      { param: 'treble', duration: 4.689, value: -0.356 },
      { label: 'label01' },
      { label: 'label01', maps: [{ type: 'duration', op: '*', num: 2 }] },
    ],
  },
  edge00: 'non-object value',
  edge01: {
    level: 1,
    contents: 'non-array contents',
  },
  edge02: {
    level: 'non-number level',
    contents: [{ label: 'label01' }],
  },
  edge03: {
    level: -1, // negative level
    contents: [{ label: 'label01' }],
  },
  edge04: {
    level: 0.5, // smaller than level of label01
    contents: [{ label: 'label01' }],
  },
  edge05: {
    level: 1,
    contents: ['non-object contents item'],
  },
  edge06: {
    level: 1, // referencing a label with non-object value
    contents: [{ label: 'edge00' }],
  },
  edge07: {
    level: 1,
    contents: [{ notLabelOrParam: 'contents item has neither label nor param keys' }],
  },
};

// Successful constructions
test('Construct level 1 library entry', () => {
  const sca = new SynthControlArray({ library, label: 'label01' });
  expect(sca.length).toEqual(3);
  expect(sca.get(0).value).toEqual(240);
});

test('Construct level 2 (iterated) library entry', () => {
  const sca = new SynthControlArray({ library, label: 'label02' });
  expect(sca.length).toEqual(7);
  expect(sca.get(0).param).toEqual('treble');
  expect(sca.get(3).duration).toEqual(12);
  expect(sca.get(6).duration).toEqual(24);
});

// Unsuccessful constructions and edge cases
test('bad library', () => {
  const sca = new SynthControlArray({ library: 'I am a bad library', label: 'any label' });
  expect(sca.length).toEqual(0);
});

test('non-existent label', () => {
  const sca = new SynthControlArray({ library, label: 'thisLabelCannotBeFound' });
  expect(sca.length).toEqual(0);
});

test('non-object value', () => {
  const sca = new SynthControlArray({ library, label: 'edge00' });
  expect(sca.length).toEqual(0);
});

test('non-array contents', () => {
  const sca = new SynthControlArray({ library, label: 'edge01' });
  expect(sca.length).toEqual(0);
});

test('non-number level', () => {
  const sca = new SynthControlArray({ library, label: 'edge02' });
  expect(sca.length).toEqual(0);
});

test('negative level', () => {
  const sca = new SynthControlArray({ library, label: 'edge03' });
  expect(sca.length).toEqual(0);
});

test('inner level higher', () => {
  const sca = new SynthControlArray({ library, label: 'edge04' });
  expect(sca.length).toEqual(0);
});

test('non-object contents item', () => {
  const sca = new SynthControlArray({ library, label: 'edge05' });
  expect(sca.length).toEqual(0);
});

test('inner label has value that is not an object', () => {
  const sca = new SynthControlArray({ library, label: 'edge06' });
  expect(sca.length).toEqual(0);
});

test('contents item has neither label nor param keys', () => {
  const sca = new SynthControlArray({ library, label: 'edge07' });
  expect(sca.length).toEqual(0);
});
