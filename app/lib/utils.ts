import { createCn } from "cn/config";

// The type scale in app.css (text-h*, text-sh*, text-b*, ...) sets size, line
// height and weight together. Without this group the merger treats those
// classes as text colors and drops them next to a color class like text-ink.
const typeScale = [
  ...Array.from({ length: 9 }, (_, i) => `h${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `sh${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `b${i + 1}`),
  "heading",
  "subheading",
  "body",
];

export const cn = createCn({
  extend: {
    classGroups: { "type-scale": [{ text: typeScale }] },
    conflictingClassGroups: {
      "type-scale": ["font-size", "leading", "font-weight"],
      "font-size": ["type-scale"],
    },
  },
});
