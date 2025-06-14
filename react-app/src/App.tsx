import { useEffect, useRef, useState } from "react";
import Button from "./components/Button";
import Canvas from "./components/Canvas";
import { webSocketInit } from "./services/WebSocket";

const keypad = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];

let ws: WebSocket | null;

function keyEvent(event: React.KeyboardEvent<any>, mode: string) {
  console.log("Event Fired");
  let letter;
  switch (event.key) {
    case "1":
      letter = "1";
      break;
    case "2":
      letter = "2";
      break;
    case "3":
      letter = "3";
      break;
    case "4":
      letter = "12";
      break;
    case "q":
      letter = "4";
      break;
    case "w":
      letter = "5";
      break;
    case "e":
      letter = "6";
      break;
    case "r":
      letter = "13";
      break;
    case "a":
      letter = "7";
      break;
    case "s":
      letter = "8";
      break;
    case "d":
      letter = "9";
      break;
    case "f":
      letter = "14";
      break;
    case "z":
      letter = "10";
      break;
    case "x":
      letter = "0";
      break;
    case "c":
      letter = "11";
      break;
    case "v":
      letter = "15";
      break;
    default:
      console.log("NOT VALID KEY");
      letter = "NO";
  }
  if (letter !== "NO" && ws) {
    if (
      (mode === "down" && keypad[parseInt(letter)] === false) ||
      (mode === "up" && keypad[parseInt(letter)] === true)
    ) {
      console.log(letter + " triggered");
      let message = { type: "input", letter: letter };
      ws.send(JSON.stringify(message));
      keypad[parseInt(letter)] = !keypad[parseInt(letter)];
    }
  }
}

function App() {
  const scale = 10;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let [startStopButtonText, setStartStop] = useState("Start");
  let [[pauseResumeButtonText, pauseResumeDisabled], setPauseResume] = useState(
    ["Pause", true]
  );
  let [stepDisabled, setStepDisabled] = useState(true);
  const registers = [
    ["V0", "V1", "V2", "V3"],
    ["V4", "V5", "V6", "V7"],
    ["V8", "V9", "VA", "VB"],
    ["VC", "VD", "VE", "VF"],
  ];
  const debugInfo = [
    ["PC", "INS", "I"],
    ["DT", "ST"],
  ];
  let vRegisterRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  let debugRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  let stackPointerRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  let stackRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  let startStopButtonClick = () => {
    if (canvasRef.current) {
      if (startStopButtonText === "Start") {
        const url = "ws:localhost:3000";
        ws = webSocketInit(
          url,
          canvasRef.current,
          vRegisterRefs.current,
          debugRefs.current,
          stackPointerRefs.current,
          stackRefs.current,
          scale
        );
        setPauseResume(["Pause", false]);
        setStartStop("Stop");
      } else {
        if (ws) {
          //Stop the Program
          let message = { type: "state", command: "stop" };
          ws.send(JSON.stringify(message));
          ws.close();
          //Clearing all values and re rendering the container

          //Resetting Canvas

          let canvas = canvasRef.current;
          if (canvas) {
            let cxt = canvas.getContext("2d");
            if (cxt) {
              cxt.fillStyle = "black";
              cxt.fillRect(0, 0, 64 * scale, 32 * scale);
            }
          }

          // Resetting V Registers

          for (let i = 0; i < 16; i++) {
            let reg = vRegisterRefs.current[i];
            console.log("First " + i);
            if (reg) {
              console.log("Second " + i);
              reg.innerHTML = registers[Math.floor(i / 4)][i % 4] + ": 0x0";
            }
          }

          //Resetting Debug States

          const debug = debugRefs.current;

          if (debug[0] && debug[1] && debug[2] && debug[3] && debug[4]) {
            debug[0].innerHTML = "PC: 0x0";
            debug[1].innerHTML = "Ins: 0x0";
            debug[2].innerHTML = "I: 0x0";
            debug[3].innerHTML = "DT: 0";
            debug[4].innerHTML = "ST: 0";
          }

          //Changing Stack and Stack Pointers

          const stack = stackRefs.current;
          const stackPointer = stackPointerRefs.current;
          for (let i = 0; i < 16; i++) {
            if (stack[i]) {
              stack[i]!.innerHTML = "0x0";
            }
            if(stackPointer[i]){
              stackPointer[i]!.innerHTML = (i == 0) ? "^" : "";
            }
          }

          //Changing Button States

          pauseResumeDisabled = true;
          setPauseResume(["Pause", true]);
          setStartStop("Start");
          setStepDisabled(true);
        }
      }
    }
  };
  let pauseResumeButtonClick = () => {
    if (ws) {
      if (pauseResumeButtonText === "Pause") {
        //Pause the Program

        let message = {type: "state", command: "pause"}
        ws.send(JSON.stringify(message));
        setPauseResume(["Resume", false]);
        setStepDisabled(false);
      } else {
        //Resume the Program
        let message = {type: "state", command: "resume"};
        ws.send(JSON.stringify(message));
        setPauseResume(["Pause", false]);
        setStepDisabled(true);
      }
    }
  };
  let onStepClicked = () => {
    if(ws){
      let message = {type: "state", command: "step"};
      ws.send(JSON.stringify(message));
    }
  };
  useEffect(() => {
    let canvas = canvasRef.current;
    if (canvas) {
      let cxt = canvas.getContext("2d");
      if (cxt) {
        cxt.fillStyle = "black";
        cxt.fillRect(0, 0, 64 * scale, 32 * scale);
      }
    }
    const handleKeyDown = (event: KeyboardEvent) =>
      keyEvent(event as any, "down");
    const handleKeyUp = (event: KeyboardEvent) => keyEvent(event as any, "up");

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <>
      <h1 className="text-center mt-3">CHIP 8 Visualizer</h1>
      <div className="container-fluid mt-5">
        <div className="row">
          <div className="col-5 mb-2">
            <div className="row">
              <div className="col-sm d-flex justify-content-center">
                <Button onClick={startStopButtonClick}>
                  {startStopButtonText}
                </Button>
              </div>
              <div className="col-sm d-flex justify-content-center">
                <Button
                  disabled={pauseResumeDisabled}
                  onClick={pauseResumeButtonClick}
                >
                  {pauseResumeButtonText}
                </Button>
              </div>
              <div className="col-sm d-flex justify-content-center">
                <Button onClick={onStepClicked} disabled={stepDisabled}>Step</Button>
              </div>
            </div>
            <div className="row">
              <div className="col-sm mt-4 mb-2 d-flex justify-content-center">
                <h2>V Registers</h2>
              </div>
            </div>
            {registers.map((val) => {
              return (
                <div className="row">
                  {val.map((reg) => {
                    return (
                      <div className="col-sm d-flex justify-content-center">
                        <h5
                          ref={(el) => {
                            vRegisterRefs.current[parseInt(reg[1])] = el;
                          }}
                        >
                          {reg + ": " + "0x0"}
                        </h5>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {debugInfo.map((row, i) => {
              return (
                <div className="row">
                  {row.map((val, index) => {
                    return (
                      <div className="col-sm mt-4 d-flex justify-content-center">
                        <h5
                          className="text-center"
                          ref={(el) => {
                            debugRefs.current[i * 3 + index] = el;
                          }}
                        >
                          {val + ": " + 0x0}
                        </h5>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="col-7 d-flex justify-content-center">
            <Canvas
              reference={canvasRef}
              canvas_width={(64 * scale).toString()}
              canvas_height={(32 * scale).toString()}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <h2>Stack:</h2>
          </div>
        </div>
        <div className="row mt-2">
          {Array.from({ length: 16 }).map((_, i) => {
            return (
              <div className="col-sm d-flex justify-content-center">
                <h5
                  className="text-center"
                  ref={(el) => {
                    stackPointerRefs.current[i] = el;
                  }}
                >
                  {i === 0 ? "^" : ""}
                </h5>
              </div>
            );
          })}
        </div>
        <div className="row">
          {Array.from({ length: 16 }).map((_, i) => {
            return (
              <div className="col-sm d-flex justify-content-center">
                <h5
                  className="text-center"
                  ref={(el) => {
                    stackRefs.current[i] = el;
                  }}
                >
                  0x0
                </h5>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
