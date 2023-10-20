import assert from "node:assert";
import { describe, it } from "node:test";
import { lazyParseJSON } from "../parser.js";

describe("lazyParseJSON", () => {
  describe("Corner cases", () => {
    it("outputs nothing for a empty JSON", async () => {
      const text = (async function* () {
        yield `{}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, []);
    });

    it("throws an error for a invalid JSON", async () => {
      const text = (async function* () {
        yield `{foo: "bar"}`;
      })();

      const exec = async function parse() {
        const parser = lazyParseJSON(text);
        await parser.next();
      };

      await assert.rejects(exec, {
        name: "Error",
      });
    });
  });

  describe("Objects", () => {
    it("parses a simple JSON", async () => {
      const text = (async function* () {
        yield `{"foo": "bar", "baz": "qux"}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, [
        { value: "bar", depth: 0, key: "foo", line: 0 },
        { value: "qux", depth: 0, key: "baz", line: 1 },
      ]);
    });

    it("parses a JSON with nested objects", async () => {
      const text = (async function* () {
        yield `{"foo": {"bar": "baz"}, "qux": {"quux": "quuz"}}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, [
        { value: "{", depth: 0, key: "foo", line: 0 },
        { value: "baz", depth: 1, key: "bar", line: 1 },
        { value: "}", depth: 0, key: null, line: 2 },
        { value: "{", depth: 0, key: "qux", line: 3 },
        { value: "quuz", depth: 1, key: "quux", line: 4 },
        { value: "}", depth: 0, key: null, line: 5 },
      ]);
    });

    it("parses JSON with deeply nested objects", async () => {
      const text = (async function* () {
        yield `{"foo": {"bar": {"baz": {"qux": {"quux": {"quuz": {"corge": {"grault": {"garply": {"waldo": {"fred": {"plugh": {"xyzzy": {"thud": "foo"}}}}}}}}}}}}}}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, [
        { value: "{", depth: 0, key: "foo", line: 0 },
        { value: "{", depth: 1, key: "bar", line: 1 },
        { value: "{", depth: 2, key: "baz", line: 2 },
        { value: "{", depth: 3, key: "qux", line: 3 },
        { value: "{", depth: 4, key: "quux", line: 4 },
        { value: "{", depth: 5, key: "quuz", line: 5 },
        { value: "{", depth: 6, key: "corge", line: 6 },
        { value: "{", depth: 7, key: "grault", line: 7 },
        { value: "{", depth: 8, key: "garply", line: 8 },
        { value: "{", depth: 9, key: "waldo", line: 9 },
        { value: "{", depth: 10, key: "fred", line: 10 },
        { value: "{", depth: 11, key: "plugh", line: 11 },
        { value: "{", depth: 12, key: "xyzzy", line: 12 },
        { value: "foo", depth: 13, key: "thud", line: 13 },
        { value: "}", depth: 12, key: null, line: 14 },
        { value: "}", depth: 11, key: null, line: 15 },
        { value: "}", depth: 10, key: null, line: 16 },
        { value: "}", depth: 9, key: null, line: 17 },
        { value: "}", depth: 8, key: null, line: 18 },
        { value: "}", depth: 7, key: null, line: 19 },
        { value: "}", depth: 6, key: null, line: 20 },
        { value: "}", depth: 5, key: null, line: 21 },
        { value: "}", depth: 4, key: null, line: 22 },
        { value: "}", depth: 3, key: null, line: 23 },
        { value: "}", depth: 2, key: null, line: 24 },
        { value: "}", depth: 1, key: null, line: 25 },
        { value: "}", depth: 0, key: null, line: 26 },
      ]);
    });
  });

  describe("Nested arrays", () => {
    it("parses a JSON with nested arrays", async () => {
      const text = (async function* () {
        yield `{"foo": ["bar", "baz"], "qux": ["quux", "quuz"]}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, [
        { value: "[", depth: 0, key: "foo", line: 0 },
        { value: "bar", depth: 1, key: 0, line: 1 },
        { value: "baz", depth: 1, key: 1, line: 2 },
        { value: "]", depth: 0, key: null, line: 3 },
        { value: "[", depth: 0, key: "qux", line: 4 },
        { value: "quux", depth: 1, key: 0, line: 5 },
        { value: "quuz", depth: 1, key: 1, line: 6 },
        { value: "]", depth: 0, key: null, line: 7 },
      ]);
    });

    it("parses a JSON with nested arrays and objects", async () => {
      const text = (async function* () {
        yield `{"foo": ["bar", {"baz": "qux"}], "quux": ["quuz", {"corge": {"grault": "garply"}}]}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }
      assert.deepStrictEqual(events, [
        { value: "[", depth: 0, key: "foo", line: 0 },
        { value: "bar", depth: 1, key: 0, line: 1 },
        { value: "{", depth: 1, key: 1, line: 2 },
        { value: "qux", depth: 2, key: "baz", line: 3 },
        { value: "}", depth: 1, key: null, line: 4 },
        { value: "]", depth: 0, key: null, line: 5 },
        { value: "[", depth: 0, key: "quux", line: 6 },
        { value: "quuz", depth: 1, key: 0, line: 7 },
        { value: "{", depth: 1, key: 1, line: 8 },
        { value: "{", depth: 2, key: "corge", line: 9 },
        { value: "garply", depth: 3, key: "grault", line: 10 },
        { value: "}", depth: 2, key: null, line: 11 },
        { value: "}", depth: 1, key: null, line: 12 },
        { value: "]", depth: 0, key: null, line: 13 },
      ]);
    });

    it("parses a JSON with deeply nested arrays", async () => {
      const text = (async function* () {
        yield `{"foo": ["bar", ["baz", ["qux", ["quux", ["quuz", ["corge"]]]]]]}`;
      })();

      const parser = lazyParseJSON(text);
      const events = [];
      for await (const event of parser) {
        events.push(event);
      }

      assert.deepStrictEqual(events, [
        { value: "[", depth: 0, key: "foo", line: 0 },
        { value: "bar", depth: 1, key: 0, line: 1 },
        { value: "[", depth: 1, key: 1, line: 2 },
        { value: "baz", depth: 2, key: 0, line: 3 },
        { value: "[", depth: 2, key: 1, line: 4 },
        { value: "qux", depth: 3, key: 0, line: 5 },
        { value: "[", depth: 3, key: 1, line: 6 },
        { value: "quux", depth: 4, key: 0, line: 7 },
        { value: "[", depth: 4, key: 1, line: 8 },
        { value: "quuz", depth: 5, key: 0, line: 9 },
        { value: "[", depth: 5, key: 1, line: 10 },
        { value: "corge", depth: 6, key: 0, line: 11 },
        { value: "]", depth: 5, key: null, line: 12 },
        { value: "]", depth: 4, key: null, line: 13 },
        { value: "]", depth: 3, key: null, line: 14 },
        { value: "]", depth: 2, key: null, line: 15 },
        { value: "]", depth: 1, key: null, line: 16 },
        { value: "]", depth: 0, key: null, line: 17 },
      ]);
    });
  });
});
