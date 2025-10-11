"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var client_1 = require("react-dom/client");
require("./style.css");
var typescript_svg_1 = require("/typescript.svg");
var ui_1 = require("@repo/ui");
var App = function () { return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("a", { href: "https://vitejs.dev", target: "_blank", children: (0, jsx_runtime_1.jsx)("img", { src: "/vite.svg", className: "logo", alt: "Vite logo" }) }), (0, jsx_runtime_1.jsx)("a", { href: "https://www.typescriptlang.org/", target: "_blank", children: (0, jsx_runtime_1.jsx)("img", { src: typescript_svg_1.default, className: "logo vanilla", alt: "TypeScript logo" }) }), (0, jsx_runtime_1.jsx)(ui_1.Header, { title: "Web" }), (0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsx)(ui_1.Counter, {}) })] })); };
(0, client_1.createRoot)(document.getElementById("app")).render((0, jsx_runtime_1.jsx)(App, {}));
