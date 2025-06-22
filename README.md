# **CHIP 8 Emulator and Debugger**

A custom-built, fully interactive CHIP-8 emulator and visual debugger designed to run CHIP-8 programs while providing a rich interface for inspecting their execution. This project has evolved significantly in both functionality and technology over time, reflecting a deepening understanding of systems programming, emulation, and UI/UX design.

## **Phase 1: Foundational Emulator (C++)**

- Focus: Accurate CHIP-8 CPU emulation, memory layout, opcode decoding, and timer logic.

- Highlights:

- Implemented full instruction set

- Designed modular architecture (CPU, Memory, Interpreter, Debugger)

- Supported file I/O for loading .ch8 binaries

- Next, I needed to make sure I knew what was going on with the components while the emulator was running, so I decided to make a debugger.

## **Phase 2: Basic Frontend (Vanilla HTML/CSS/JS)**

Goal: Visualize memory and registers with a simple UI

Limitations: Manual DOM updates became hard to scale, and interface lacked interactivity and was very basic.

Tools: Vanilla JS + HTML Canvas + CSS Grid

Outcome: Prototype debugger with memory and register display, but lacked responsive updates and component reusability

## **Phase 3: Transition to React**

Technologies:

- Bootstrap CSS for styling

- WebSocket for real-time communication between the C++ backend and React frontend

Improvements:

- Realtime memory/register/state updates

- Step, pause, and breakpoint control through buttons and hotkeys

- Component-based structure made it easy to expand and maintain

## **Further Updates Needed**

- Ensure one can go step by step even without pressing start.

- Create a custom CHIP 8 file upload system using Axios or something similar.

- Update the UI to make it more aesthetically pleasing.
