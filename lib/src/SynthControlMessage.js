let id = 0;
class SynthControlMessage {
  constructor() {
    this.id = id;
    id += 1;
  }

  toString() { return `SynthControlMessage with id ${this.id}`; }
}

export default SynthControlMessage;
