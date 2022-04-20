const assert = require("assert");
const chai = require("chai");
const ts2hx = require("../src/ts2hx");

const expect = chai.expect;

describe("ts2hx", () => {
  it("returns a string", () => {
    const testInput = `
			class FooClass {
				constructor(public name: string) {
					console.log('Hello, my name is ' + this.name);
				}
			}
		`;

    const converted = ts2hx(testInput);

    expect(converted).to.be.a("string");
  });

  describe("when handling variables", () => {
    it("converts numbers to floats", () => {
      const code = `var foo: number = 1;`;
      const compiled = ts2hx(code);

      expect(compiled).to.have.string("var foo:Float = 1;");
    });

    it("converts strings to Strings", () => {
      const code = `var foo: string = "hello";`;
      const compiled = ts2hx(code);

      expect(compiled).to.have.string('var foo:String = "hello";');
    });

    it("converts bools to Bools", () => {
      const typescript = `var foo: boolean = true;`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("var foo:Bool = true;");
    });

    it("converts things with type `any` into Dynamic types", () => {
      const typescript = `var foo: any = "hello";`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string('var foo:Dynamic = "hello";');
    });

    it("converts integers if the interface type is used", () => {
      const typescript = `var integer: integer = 1;
			var float: number = 1;`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("var integer:Int = 1;");
      expect(compiled).to.have.string("var float:Float = 1;");
    });

    it("converts integers using type inference", () => {
      const typescript = `var foo = 1;
			var bar = 1.0;`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("var foo:Int = 1;");
      expect(compiled).to.have.string("var bar:Float = 1.0;");
    });
  });

  describe("with enums", () => {
    it("converts enums to haxe", () => {
      const typescript = `enum Foo {
				A,
				B,
				C
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("enum Foo {");
      expect(compiled).to.have.string("A;");
      expect(compiled).to.have.string("B;");
      expect(compiled).to.have.string("C;");
      expect(compiled).to.have.string("}");
    });

    it("converts the enum even if there are no members", () => {
      const typescript = `enum Foo {
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("enum Foo {");
      expect(compiled).to.have.string("}");
    });
  });

  describe("with interfaces", () => {
    it("converts keys to public vars with the appropriate type", () => {
      const typescript = `interface Foo {
				bar: string;
				baz: number;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("public var bar:String;");
      expect(compiled).to.have.string("public var baz:Float;");
    });

    it("converts functions into a public function", () => {
      const typescript = `interface Foo {
				bar(): string;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("public function bar():String");
    });

    it("keeps the same interface name", () => {
      const typescript = `interface Foo {
				bar(): string;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("interface Foo {");
      expect(compiled).to.have.string("}");
    });

    // it("converts functions with arrow function type syntax", () => {
    //   const typescript = `interface Foo {
    // 		bar: () => string;
    // 	}`;
    //   const compiled = ts2hx(typescript);

    //   expect(compiled).to.have.string("public function bar():String");
    // });

    it("converts functions with arguments", () => {
      const typescript = `interface Foo {
				bar(a: string, b: number): string;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string(
        "public function bar(a:String, b:Float):String"
      );
    });

    it("converts functions with a return type", () => {
      const returnTypes = ["string", "number", "boolean", "void", "any"];
      const haxeTypes = ["String", "Float", "Bool", "Void", "Dynamic"];

      for (let i = 0; i < returnTypes.length; i++) {
        const typescript = `interface Foo {
					bar(): ${returnTypes[i]};
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string(
          `public function bar():${haxeTypes[i]}`
        );
      }
    });
  });

  describe("with classes", () => {
    it("converts class names", () => {
      const typescript = `class Foo {
				bar: string;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("class Foo {");
      expect(compiled).to.have.string("}");
    });

    it("converts variables with access levels correctly", () => {
      const typescript = `class Foo {
				private bar: string;
				public baz: string;
				static public qux: string;
				static private quux: string;
				static quuz: string;
				quuz2: string;
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("private var bar:String;");
      expect(compiled).to.have.string("public var baz:String;");
      expect(compiled).to.contain.oneOf([
        "static public var qux:String;",
        "public static var qux:String;",
      ]);
      expect(compiled).to.contain.oneOf([
        "static private var quux:String;",
        "private static var quux:String;",
      ]);
      expect(compiled).to.contain.oneOf([
        "static public var quuz:String;",
        "public static var quuz:String;",
      ]);
      expect(compiled).to.contain.string("public var quuz2:String;");
    });

    describe("with functions", () => {
      it("converts functions correctly", () => {
        const typescript = `class Foo {
					bar(): string;
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string("public function bar():String");
      });

      it("converts functions with arguments", () => {
        const typescript = `class Foo {
					bar(a: string, b: number): string;
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string(
          "public function bar(a:String, b:Float):String"
        );
      });

      it("converts classes with multiple functions", () => {
        const typescript = `class Foo {
					bar(): string;
					baz(): string;
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string("public function bar():String");
        expect(compiled).to.have.string("public function baz():String");
      });

      it("handles function access levels correctly", () => {
        const typescript = `class Foo {
					private bar(): string;
					public baz(): string;
					static public qux(): string;
					static private quux(): string;
					static quuz(): string;
					quuz2(): string;
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string("private function bar():String");
        expect(compiled).to.have.string("public function baz():String");
        expect(compiled).to.contain.oneOf([
          "static public function qux():String",
          "public static function qux():String",
        ]);
        expect(compiled).to.contain.oneOf([
          "static private function quux():String",
          "private static function quux():String",
        ]);
        expect(compiled).to.contain.oneOf([
          "static public function quuz():String",
          "public static function quuz():String",
        ]);
        expect(compiled).to.contain.string("public function quuz2():String");
      });

      it("handles function return types correctly", () => {
        const returnTypes = ["string", "number", "boolean", "void", "any"];
        const haxeTypes = ["String", "Float", "Bool", "Void", "Dynamic"];

        for (let i = 0; i < returnTypes.length; i++) {
          const typescript = `class Foo {
						bar(): ${returnTypes[i]};
					}`;
          const compiled = ts2hx(typescript);

          expect(compiled).to.have.string(
            `public function bar():${haxeTypes[i]}`
          );
        }
      });
    });

    it("converts the constructor", () => {
      const typescript = `class Foo {
				constructor(a: string, b: number);
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("public function new(a:String, b:Float)");
    });

    it("works with inheritance", () => {
      const typescript = `class Foo extends Bar {
				constructor(a: string, b: number);
			}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("class Foo extends Bar {");
    });

    it("implements interfaces correctly", () => {
      const typescript = `interface Foo {
				bar(): string;
			}
			class Bar implements Foo {
				bar(): string;
			}`;

      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("class Bar implements Foo {");
    });

    describe("with getters / setters", () => {
      it("converts getters correctly", () => {
        const typescript = `class Foo {
					private _bar: string = "HI";

					get bar(): string {
						return "bar";
					}

					set bar(value: string) {
						this._bar = value;
					}
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string("public var bar(get, set):String");
        expect(compiled).to.have.string("public function get_bar():String {");
        expect(compiled).to.have.string(
          "public function set_bar(value:String):String {"
        );
      });

      it("converts multiple getters correctly", () => {
        const typescript = `class Foo {
					private _bar: string = "HI";
					private _baz: string = "HI";

					get bar(): string {
						return "bar";
					}

					get baz(): string {
						return "baz";
					}

					set bar(value: string) {
						this._bar = value;
					}

					set baz(value: string) {
						this._baz = value;
					}
				}`;
        const compiled = ts2hx(typescript);

        expect(compiled).to.have.string("public var bar(get, set):String");
        expect(compiled).to.have.string("public var baz(get, set):String");
        expect(compiled).to.have.string("public function get_bar():String {");
        expect(compiled).to.have.string("public function get_baz():String {");
        expect(compiled).to.have.string(
          "public function set_bar(value:String):String {"
        );
        expect(compiled).to.have.string(
          "public function set_baz(value:String):String {"
        );
      });
    });

    it("ensures arrow functions have the correct reference to `this`", () => {
      const typescript = `class Foo {
				 public name: string = 'Foo';
					bar() {
						var someClosure = () => {
							this.name += 'Bar';
						};
					}
				}`;
      const compiled = ts2hx(typescript);

      expect(compiled).to.have.string("var __this = this;");
      expect(compiled).to.have.string("var someClosure = function() {");
      expect(compiled).to.have.string("__this.name += 'Bar';");
    });
  });

  it("converts console.log to trace", () => {
    const typescript = `class Foo {
				public bar() {
					console.log('hi');
				}
			}`;
    const compiled = ts2hx(typescript);

    expect(compiled).to.contain.oneOf(["trace('hi');", 'trace("hi");']);
  });

  it("converts for loops with an incrementer into while loops", () => {
    const typescript = `for (var i = 0, len = 12; i < len; i++) {
			console.log("for iteration #" + i);
		}`;

    const compiled = ts2hx(typescript);

    expect(compiled).to.contain.string("while (i < len) {");
    expect(compiled).to.contain.string("i++;");
    expect(compiled).to.contain.oneOf(["var len:Int = 12", "len:Int = 12"]);
    expect(compiled).to.contain.oneOf(["var i:Int = 0", "i:Int = 0"]);
  });
});
