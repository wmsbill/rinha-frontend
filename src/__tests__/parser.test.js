import assert from "node:assert";
import { describe, it } from "node:test";
import { customJSONParser } from "../parser.js";

describe("lazyParseJSON", () => {
  describe("Corner cases", () => {
    it("outputs nothing for a empty JSON", async () => {
      const text = `{}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, []);
    });

    it("throws an error for a invalid JSON", async () => {
      const text = `{foo: "bar"}`;

      const exec = function parse() {
        return customJSONParser(text);
      };

      await assert.throws(exec, {
        name: "Error",
      });
    });
  });

  describe("Objects", () => {
    it("parses a simple JSON", async () => {
      const text = `{"foo": "bar", "baz": "qux"}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "bar"],
        [0, "baz", "qux"],
      ]);
    });

    it("parses a JSON with nested objects", async () => {
      const text = `{"foo": {"bar": "baz"}, "qux": {"quux": "quuz"}}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "{"],
        [1, "bar", "baz"],
        [0, "", "}"],
        [0, "qux", "{"],
        [1, "quux", "quuz"],
        [0, "", "}"],
      ]);
    });

    it("parses JSON with deeply nested objects", async () => {
      const text = `{"foo": {"bar": {"baz": {"qux": {"quux": {"quuz": {"corge": {"grault": {"garply": {"waldo": {"fred": {"plugh": {"xyzzy": {"thud": "foo"}}}}}}}}}}}}}}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "{"],
        [1, "bar", "{"],
        [2, "baz", "{"],
        [3, "qux", "{"],
        [4, "quux", "{"],
        [5, "quuz", "{"],
        [6, "corge", "{"],
        [7, "grault", "{"],
        [8, "garply", "{"],
        [9, "waldo", "{"],
        [10, "fred", "{"],
        [11, "plugh", "{"],
        [12, "xyzzy", "{"],
        [13, "thud", "foo"],
        [12, "", "}"],
        [11, "", "}"],
        [10, "", "}"],
        [9, "", "}"],
        [8, "", "}"],
        [7, "", "}"],
        [6, "", "}"],
        [5, "", "}"],
        [4, "", "}"],
        [3, "", "}"],
        [2, "", "}"],
        [1, "", "}"],
        [0, "", "}"],
      ]);
    });
  });

  describe("Arrays", () => {
    it("parses an empty array", async () => {
      const text = `[]`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, 0, "["],
        [0, "", "]"],
      ]);
    });

    it("parses a simple array", async () => {
      const text = `["foo", "bar"]`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, 0, "["],
        [1, 0, "foo"],
        [1, 1, "bar"],
        [0, "", "]"],
      ]);
    });

    it("parses a JSON with nested arrays", async () => {
      const text = `{"foo": ["bar", "baz"], "qux": ["quux", "quuz"]}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "["],
        [1, 0, "bar"],
        [1, 1, "baz"],
        [0, "", "]"],
        [0, "qux", "["],
        [1, 0, "quux"],
        [1, 1, "quuz"],
        [0, "", "]"],
      ]);
    });

    it("parses a JSON with nested arrays and objects", async () => {
      const text = `{"foo": ["bar", {"baz": "qux"}], "quux": ["quuz", {"corge": {"grault": "garply"}}]}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "["],
        [1, 0, "bar"],
        [1, 1, "{"],
        [2, "baz", "qux"],
        [1, "", "}"],
        [0, "", "]"],
        [0, "quux", "["],
        [1, 0, "quuz"],
        [1, 1, "{"],
        [2, "corge", "{"],
        [3, "grault", "garply"],
        [2, "", "}"],
        [1, "", "}"],
        [0, "", "]"],
      ]);
    });

    it("parses a JSON with deeply nested arrays", async () => {
      const text = `{"foo": ["bar", ["baz", ["qux", ["quux", ["quuz", ["corge"]]]]]]}`;
      const events = await customJSONParser(text);

      assert.deepStrictEqual(events, [
        [0, "foo", "["],
        [1, 0, "bar"],
        [1, 1, "["],
        [2, 0, "baz"],
        [2, 1, "["],
        [3, 0, "qux"],
        [3, 1, "["],
        [4, 0, "quux"],
        [4, 1, "["],
        [5, 0, "quuz"],
        [5, 1, "["],
        [6, 0, "corge"],
        [5, "", "]"],
        [4, "", "]"],
        [3, "", "]"],
        [2, "", "]"],
        [1, "", "]"],
        [0, "", "]"],
      ]);
    });
  });
});
