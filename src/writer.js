class Writer {
  #value;

  constructor(value = "") {
    this.#value = value;
  }

  get output() {
    return this.#value;
  }

  set output(value) {
    this.#value = value;
  }

  write(str) {
    this.output += str;
  }
}

module.exports = Writer;
