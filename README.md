# greyhack-scripts
A collection of custom scripts and libraries and a compiler i use in the game Greyhack to make life easier and the game more enjoyable.
Most scripts depend on in some way one or more custom libraries found in the include folder and the compiler included.
In order to use these scripts install the dependencies and follow the installation instructions.
The software is compiled using the g++ (gpp) compiler.

## Notes
***The files in this repository all have the extension ".gs" in order for them to be used with the vscode extension for greyhack scripting.
When you save these scripts inside Greyhack, please make sure to save them with the ".src" extension in order for them to work properly***

# Dependencies
* Grey Hack g++/gpp 2.1.9 (forked and modified in this repository)

# Dependency installation
* Build the gpp.gs using the in-game code editor or commandline tool "build" and save the binary to /bin
* Place the corelib.gs in a new file at /lib/corelib.src
* Make a new folder in game then copy all the files from the include folder into it

# Installation of my scripts
* Place the tools you want from my src folder anywhere you'd like in game
* Open the script(s) and at the top change the `#/home/0xdead/include/` to the absolute path (full path) to where you placed all the libraries from the repository folder *include*. For example `#/home/user/include`
* Build the script using `gpp [path to source file] [outputfolder]` for example `gpp /home/0xdead/src/tools/decipher.src /bin`
  Its also possible to build from the current directory by specifying only the source file and an output directory of "." meaning build the binary in the current folder
* Now you can launch the program from where its built



