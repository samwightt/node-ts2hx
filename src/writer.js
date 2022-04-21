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

  writeLineBreak() {
    this.write("\n");
  }

  clearOutput() {
    this.output = "";
  }
}

module.exports = Writer;
