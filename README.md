A web-based CHIP-8 debugger with a Node.js backend and interactive frontend. Built to help visualize, step through, 
and understand CHIP-8 programs with a clean, responsive interface.

I used nodejs as the backend and vanilla html/css/javascript as the frontend.

The nodejs server spawns a CHIP 8 Emulator written in C++ which then communicates with the front end to display register state, current instruction, etc.
