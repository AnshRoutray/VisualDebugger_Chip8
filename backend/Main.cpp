#define SDL_MAIN_HANDLED 

#include <SDL.h>
#include <iostream>
#include <fstream>
#include <chrono>
#include <random>
#include <cstdint>

#define DISPLAY_WIDTH 64
#define DISPLAY_HEIGHT 32
#define SCALE 10

using namespace std;

random_device rd;                          // Seed source
mt19937 gen(rd());                         // Mersenne Twister RNG
uniform_int_distribution<> dist(0, 255);

int mapKey(SDL_Keycode key){
    switch (key) {
        case SDLK_1: return 0x1; 
        case SDLK_2: return 0x2;
        case SDLK_3: return 0x3;
        case SDLK_4: return 0xC;
        case SDLK_q: return 0x4;
        case SDLK_w: return 0x5;
        case SDLK_e: return 0x6;
        case SDLK_r: return 0xD;
        case SDLK_a: return 0x7;
        case SDLK_s: return 0x8;
        case SDLK_d: return 0x9;
        case SDLK_f: return 0xE;
        case SDLK_z: return 0xA;
        case SDLK_x: return 0x0;
        case SDLK_c: return 0xB;
        case SDLK_v: return 0xF;
        default: return -1;
    }
}

class Chip8 {
    public:
        Chip8(SDL_Renderer* r) {

            //Initialize Renderer

            renderer = r;

            //Initialize the memory with default fontset

            for (int i = 0; i < 80; ++i) {
                memory[i] = fontset[i];
            }

            //Initialize a blank display

            for(int i = 0; i < DISPLAY_HEIGHT; i++) {
                for(int j = 0; j < DISPLAY_WIDTH; j++) {
                    display[i][j] = false;
                }
            }

            //Initialize registers and timers

            pc = 0x200; // Program starts at 0x200
            I = 0;
            sp = 0;
            delay_timer = 0;
            sound_timer = 0;
        }

        void emulateCycle() {
            //Fetching Instruction From Memory

            uint16_t opcode = memory[pc] << 8 | memory[pc + 1];
            pc += 2; 

            //Decoding instruction  

            uint16_t ins = (opcode & 0xF000) >> 12; 
            uint16_t x = (opcode & 0x0F00) >> 8;
            uint16_t y = (opcode & 0x00F0) >> 4;
            uint16_t n = opcode & 0x000F;
            uint16_t nn = opcode & 0x00FF;
            uint16_t nnn = opcode & 0x0FFF;             
            switch(ins) {
                case 0x0:{
                    if(opcode == 0x00E0){
                        for(int i = 0; i < DISPLAY_HEIGHT; i++) {
                            for(int j = 0; j < DISPLAY_WIDTH; j++) {
                                display[i][j] = false;
                            }
                        }
                        drawGraphics();
                    }
                    else if(opcode == 0x00EE){
                        pc = stack[sp - 1];
                        sp--;
                    }
                }
                break;
                case 0x1:{
                    pc = nnn;
                }
                break;
                case 0x2:{
                    stack[sp++] = pc;
                    pc = nnn;
                }
                break;
                case 0x3:{
                    if(V[x] == nn){
                        pc += 2;
                    }
                }
                break;
                case 0x4:{
                    if(V[x] != nn){
                        pc += 2;
                    }
                }
                break;
                case 0x5:{
                    if(V[x] == V[y]){
                        pc += 2;
                    }
                }
                break;
                case 0x6:{
                    V[x] = nn;
                }
                break;
                case 0x7:{
                    V[x] += nn;
                }
                break;
                case 0x8:{
                    if(n == 0){
                        V[x] = V[y];
                    }
                    else if(n == 1){
                        V[x] = V[x] | V[y];
                    }
                    else if(n == 2){
                        V[x] = V[x] & V[y];
                    }
                    else if(n == 3){
                        V[x] = V[x] ^ V[y];
                    }
                    else if(n == 4){
                        V[x] = V[x] + V[y];
                    }
                    else if(n == 5){
                        V[x] = V[x] - V[y];
                    }
                    else if(n == 7){
                        V[x] = V[y] - V[x];
                    }
                    else if(n == 6){ //Ambiguous Instruction (Modern)
                        uint8_t num = V[x];
                        V[x] = num >> 1;
                        V[0xF] = num & 1;
                    }
                    else if(n == 0xE){
                        uint8_t num = V[x];
                        V[x] = num << 1;
                        V[0xF] = num & 0x80;
                    }
                }
                break;
                case 0x9:{
                    if(V[x] != V[y]){
                        pc += 2;
                    }
                }
                break;
                case 0xA:{
                    I = nnn;
                }
                break;
                case 0xB:{ //Ambiguous Instruction (CHIP 48, SUPERCHIP)
                    pc = nnn + V[x];
                }
                break;
                case 0xC:{
                    uint8_t rand = dist(gen);
                    V[x] = rand & nn;
                }
                break;
                case 0xD:{
                    uint8_t x_coord = V[x] % 64;
                    uint8_t y_coord = V[y] % 32;
                    uint16_t pointer = I;
                    uint8_t sprite_data;
                    V[0xF] = 0;
                    for(int j = y_coord; j < y_coord + n && j < DISPLAY_HEIGHT; j++){
                        sprite_data = memory[pointer];
                        for(int i = 0; i < 8 && x_coord + i < DISPLAY_WIDTH; i++){
                            bool sprite_bit = (sprite_data >> (7 - i)) & 1;
                            if(sprite_bit && display[j][x_coord + i]){
                                V[0xF] = 1;
                            }
                            display[j][x_coord + i] ^= sprite_bit;
                        }
                        pointer++;
                    }
                    drawGraphics();
                }
                break;
                case 0xE:{
                    if(nn == 0x9E){
                        if(keypad[V[x]]){
                            pc += 2;
                        }
                    }
                    else if(nn == 0xA1){
                        if(!keypad[V[x]]){
                            pc += 2;
                        }
                    }
                }
                break;
                case 0xF:{
                    if(nn == 0x07){
                        V[x] = delay_timer;
                    }
                    else if(nn == 0x15){
                        delay_timer = V[x];
                    }
                    else if(nn == 0x18){
                        sound_timer = V[x];
                    }
                    else if(nn == 0x1E){
                        I += V[x];
                    }
                    else if(nn == 0x0A){
                        uint8_t key = 100;
                        for(int i = 0; i < 0xF; i++){
                            if(keypad[i] == true){
                                key = i;
                                V[x] = i;
                                break;
                            }
                        }
                        if(key == 100){
                            pc -= 2;
                        }
                    }
                    else if(nn == 0x29){
                        I = 5 * V[x];
                    }
                    else if(nn == 0x33){
                        uint8_t num = V[x];
                        for(int i = 2; i >= 0; i--){
                            memory[I + i] = num % 10;
                            num /= 10;
                        }
                    }
                    else if(nn == 0x55){
                        for(int i = 0; i <= x; i++){
                            memory[I + i] = V[i];
                        }
                    }
                    else if(nn == 0x65){
                        for(int i = 0; i <= x; i++){
                            V[i] = memory[I + i];
                        }
                    }
                }
                break;
            }
        }

        void drawGraphics() {  
            SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); // clear with black
            SDL_RenderClear(renderer);
            for (int j = 0; j < DISPLAY_HEIGHT; j++) {
                for (int i = 0; i < DISPLAY_WIDTH; i++) {
                    if (display[j][i]) {
                        SDL_Rect rect = {
                            i * SCALE, 
                            j * SCALE, 
                            SCALE, 
                            SCALE
                        };
                        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255); // white pixel
                        SDL_RenderFillRect(renderer, &rect);
                    }
                }
            }
            SDL_RenderPresent(renderer);
        }

        const uint8_t fontset[80] = {
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        };
        SDL_Renderer* renderer;
        uint8_t memory[4096]; // 4KB of memory
        bool keypad[16]; //KeyPad
        uint8_t V[16]; // 16 registers
        uint16_t I; // Index register
        uint16_t pc; // Program counter
        bool display[DISPLAY_HEIGHT][DISPLAY_WIDTH]; // Display buffer (64x32 pixels)
        uint8_t delay_timer; // Delay timer
        uint8_t sound_timer; // Sound timer
        uint16_t stack[16]; // Stack
        uint8_t sp; // Stack pointer
};

int main(int argc, char* argv[]) {

    string gamePath = "flightrunner.ch8"; // Path to the game file
    
    ifstream gameFile(gamePath, ios::binary);
    if (!gameFile) {
        cout << "Error opening file: " << gamePath << endl;
        return 1;
    }

    if(SDL_Init(SDL_INIT_VIDEO) != 0) {
        cout << "SDL could not initialize! SDL_Error: " << SDL_GetError() << endl;
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("CHIP-8 Emulator", 100, 100, 
        DISPLAY_WIDTH * SCALE, DISPLAY_HEIGHT * SCALE, SDL_WINDOW_SHOWN);

    if(window == NULL) {
        cout << "Window could not be created! SDL_Error: " << SDL_GetError() << endl;
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    if(renderer == NULL) {
        cout << "Renderer could not be created! SDL_Error: " << SDL_GetError() << endl;
        return 1;
    }

    Chip8 emulator(renderer);

    // Seek to the end to get the file size
    gameFile.seekg(0, ios::end);
    std::streamsize size = gameFile.tellg();
    gameFile.seekg(0, ios::beg);

    // Now read the ROM into memory starting at 0x200
    if (!gameFile.read(reinterpret_cast<char*>(&emulator.memory[0x200]), size)) {
        std::cerr << "Failed to read ROM contents!" << std::endl;
        return 1;
    }

    uint16_t addr = 0x200;
    uint8_t byte1, byte2;

    bool running = true;

    SDL_Event event;

    auto lastTime_instruction = chrono::high_resolution_clock::now();
    auto lastTime_timer = chrono::high_resolution_clock::now();
    float instructionDelay = 1000 / 700.0f;
    float timerDelay = 1000 / 60.0f;
    
    while(running){
        if(SDL_PollEvent(&event)) {
            if(event.type == SDL_QUIT) {
                running = false;
            }
            else if (event.type == SDL_KEYDOWN && !event.key.repeat) {
                uint8_t chip8Key = mapKey(event.key.keysym.sym);
                if (chip8Key != -1) {
                    emulator.keypad[chip8Key] = true;
                }
            }
            else if (event.type == SDL_KEYUP) {
                uint8_t chip8Key = mapKey(event.key.keysym.sym);
                if (chip8Key != -1) {
                    emulator.keypad[chip8Key] = false;
                }
            }
        }

        auto currentTime = chrono::high_resolution_clock::now();
        chrono::duration<float, milli> deltaTime_instruction = currentTime - lastTime_instruction;
        chrono::duration<float, milli> deltaTime_timer = currentTime - lastTime_timer;

        if(deltaTime_instruction.count() >= instructionDelay) {
            emulator.emulateCycle(); 
            lastTime_instruction = currentTime;
        }

        if(deltaTime_timer.count() >= timerDelay) {
            if(emulator.delay_timer > 0) {
                emulator.delay_timer--;
            }
            if(emulator.sound_timer > 0) {
                emulator.sound_timer--;
            }
            lastTime_timer = currentTime;
        }
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}