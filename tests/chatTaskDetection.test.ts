import { test, expect } from "bun:test";
import { detectTaskType } from "../src/utils/chatTaskDetection.ts";

test("lead generation query detected as marketing", () => {
  expect(detectTaskType("We need a lead generation strategy")).toBe("marketing");
});

test("sales funnel query detected as marketing", () => {
  expect(detectTaskType("How do I build a sales funnel for my SaaS product?"))
    .toBe("marketing");
});

test("advertising strategy query detected as marketing", () => {
  expect(detectTaskType("I need help with an advertising strategy for my new app."))
    .toBe("marketing");
});

test("SEO query detected as marketing", () => {
  expect(detectTaskType("Tips for SEO to increase traffic."))
    .toBe("marketing");
});

test("conversion query detected as marketing", () => {
  expect(detectTaskType("Improve conversion on landing page"))
    .toBe("marketing");
});

test("growth query detected as marketing", () => {
  expect(detectTaskType("Strategies for growth marketing"))
    .toBe("marketing");
});
