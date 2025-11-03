type debugState = {
  type: string;
  V: Array<number>;
  stack: Array<number>;
  pc: number;
  ins: number;
  dtim: number;
  stim: number;
  I: number;
  sp: number;
};

export function webSocketInit(
  url: string,
  canvas: HTMLCanvasElement,
  vRegisters: Array<HTMLHeadingElement | null>,
  debugRefs: Array<HTMLHeadingElement | null>,
  stackPointerRefs: Array<HTMLHeadingElement | null>,
  stackRefs: Array<HTMLHeadingElement | null>,
  scale: number
) {
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("Connections established between Client and Server");
  };
  ws.onmessage = (event) => {
    const data = event.data;
    const parsedData = JSON.parse(data);
    if (parsedData.type === "display") {
      updateDisplay(canvas.getContext("2d"), parsedData.display, scale);
    } else if (parsedData.type === "state") {
      updateDebugState(
        vRegisters,
        stackRefs,
        debugRefs,
        stackPointerRefs,
        parsedData as debugState
      );
    } else {
      console.error("Unknown Type of data type received.");
    }
  };
  return ws;
}

function updateDisplay(
  canvas: CanvasRenderingContext2D | null,
  change: Array<String>,
  scale: number
) {
  if (canvas) {
    for (let i = 0; i < change.length; i++) {
      let word = change[i];
      let y = Number(word[0] + word[1]);
      let x = Number(word[2] + word[3]);
      const currentColor = canvas.getImageData(
        x * scale + 2,
        y * scale + 2,
        1,
        1
      ).data;
      canvas.fillStyle = currentColor[0] === 0 ? "white" : "black";
      canvas.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function updateDebugState(
  V: Array<HTMLHeadingElement | null>,
  stack: Array<HTMLHeadingElement | null>,
  debug: Array<HTMLHeadingElement | null>,
  stackPointers: Array<HTMLHeadingElement | null>,
  parsedData: debugState
) {
  for (let i = 0; i < 16; i++) {
    let reg = V[i];
    if (reg) {
      reg.innerHTML =
        "V" + i.toString(16) + ": 0x" + parsedData.V[i].toString(16);
    }
  }
  let sp = parsedData["sp"];
  if (sp > 0 && stackPointers[sp - 1]) {
    stackPointers[sp - 1]!.innerHTML = "";
  }
  if (sp < 15 && stackPointers[sp + 1]) {
    stackPointers[sp + 1]!.innerHTML = "";
  }
  if (stackPointers[sp]) {
    stackPointers[sp].innerHTML = "^";
  }
  for (let i = 0; i < 16; i++) {
    if (stack[i]) {
      stack[i]!.innerHTML = "0x" + parsedData["stack"][i].toString(16);
    }
  }
  if (debug[0] && debug[1] && debug[2] && debug[3] && debug[4]) {
    debug[0].innerHTML = "PC: 0x" + parsedData["pc"].toString(16);
    debug[1].innerHTML = "Ins: 0x" + parsedData["ins"].toString(16);
    debug[2].innerHTML = "I: 0x" + parsedData["I"].toString(16);
    debug[3].innerHTML = "DT: " + parsedData["dtim"];
    debug[4].innerHTML = "ST: " + parsedData["stim"];
  }
}