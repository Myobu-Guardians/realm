// Import EchoMD related modules
// EchoMD
// Essential
import "@0xgg/echomd"; // ESSENTIAL
import { setTwemojiOptions } from "@0xgg/echomd/addon/emoji";
import "@0xgg/echomd/powerpack/fold-code-with-echarts";
import "@0xgg/echomd/powerpack/fold-code-with-mermaid";
import "@0xgg/echomd/powerpack/fold-code-with-plantuml";
import "@0xgg/echomd/powerpack/fold-code-with-wavedrom";
import "@0xgg/echomd/powerpack/fold-emoji-with-twemoji";
// Widgets
// Load PowerPacks if you want to utilize 3rd-party libs
import "@0xgg/echomd/powerpack/fold-math-with-katex";
import "@0xgg/echomd/powerpack/hover-with-marked";
import { enableEmoji } from "@0xgg/echomd/preview";
import { registerWidgetCreator } from "@0xgg/echomd/widget";
import "codemirror";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/hint/show-hint";
// Load these modes if you want highlighting ...
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed"; // for embedded HTML
import "codemirror/mode/javascript/javascript"; // eg. javascript
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/python/python";
import "codemirror/mode/stex/stex"; // for Math TeX Formular
import "codemirror/mode/yaml/yaml"; // for Front Matters

// Set necessary window scope variables
window["CodeMirror"] = require("codemirror");

const packageJSON = require("../../package.json");
export const EchoMDVersion: string = packageJSON.dependencies["@0xgg/echomd"];
