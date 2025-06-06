import { test, expect } from "bun:test";
import { detectTaskType } from "../src/utils/chatTaskDetection";

test("lead generation maps to marketing", () => {
  expect(detectTaskType("Need help with lead generation for our business")).toBe(
    "marketing"
  );
});

test("sales funnel phrase maps to marketing", () => {
  expect(detectTaskType("Create a sales funnel to boost conversions")).toBe(
    "marketing"
  );
});

test("SEO and conversion growth phrase maps to marketing", () => {
  expect(
    detectTaskType("How do we improve SEO to increase conversion and growth?")
  ).toBe("marketing");
});
