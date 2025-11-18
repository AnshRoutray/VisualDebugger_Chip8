# **CHIP 8 Emulator and Debugger**

A custom-built, fully interactive CHIP-8 emulator and visual debugger designed to run CHIP-8 programs while providing an user friendly interface for inspecting their execution. This project uses skills that relate to systems programming, web development, and UI/UX Design.

## **Phase 1: Foundational Assembler (C++)**

- Focus: I firstly focused on an accurate CHIP-8 CPU emulation, memory layout, opcode decoding, and timer logic.

- Implemented full instruction set

- Designed modular architecture (CPU, Memory, Interpreter, Debugger) using OOP

- Supported file I/O for loading .ch8 binaries

- Next, I needed to make sure I knew what was going on with the components i.e the immediate state of the registers/pc/stack while the emulator was running, so I decided to make a debugger.

## **Phase 2: Basic Frontend and Backend (Vanilla HTML/CSS/JS, NodeJS)**

- Goal: Visualize memory and registers with a simple UI. Over here I just wanted to see if the communication between my nodejs backend server that contained the C++ emulator, and my frontend.

- Limitations: It was UGLY. It was also not scalable to a large extent as most of my code was extrmeley raw with almost no resuability. 

- Outcome: I created a nodejs backend server which communicated with the frontend browser via a websocket. The nodejs server would spawn a spearate CHIP 8 Emulator Program for each websocket connection established. My C++ code communicated with the nodejs server through the nlohmann JSON library.

## **Phase 3: Transition to React**

- Realtime memory/register/state updates

- Step, pause, and breakpoint control through buttons and hotkeys

- Component-based structure made it easy to expand and maintain fixing the scalability issue

- Used Bootstrap CSS to make the webpage more user friendly.

## **Further Updates Needed**

- Ensure one can go step by step even without pressing start.

- Create a custom CHIP 8 file upload system using Axios or something similar.

- Update the UI to make it more aesthetically pleasing.

