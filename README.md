# greyhack-scripts
A collection of custom scripts and libraries and a compiler i use in the game Greyhack to make life easier and the game more enjoyable.
Most scripts depend on in some way one or more custom libraries found in the include folder and the compiler included.
In order to use these scripts install the dependencies and follow the installation instructions.
The software is compiled using the g++ (gpp) compiler.

***CREDIT GOES TO Hex0de_Hex0de Hex0de [The Lone Wolf] at ghcommunity.cc for making g++/gpp. Without their hard work none of my improvements and custom functionality would be possible!***

## Notes
***The files in this repository all have the extension ".gs" in order for them to be used with the vscode extension for greyhack scripting.
When you save these scripts inside Greyhack, please make sure to save them with the ".src" extension in order for them to work properly***

# Dependencies
* Grey Hack g++/gpp 2.1.9 (forked and modified in this repository)
* https://ghcommunity.cc/t/g-v2-1-9/159 (original compiler and basic runthrough of its usage with documentation, much still applies to my fork)

## Dependency installation
* Build the compiler gpp.gs using the in-game code editor or commandline tool "build" and save the binary to /bin
* Place the compiler corelib.gs in a new file at /lib/corelib.src
* Make a new folder in game then copy all the files from the include folder into it

# Installation of my scripts
* Place the tools you want from my src folder anywhere you'd like in game
* Change the location of the `#/home/0xdead/include/INCLUDEFILE.src` to match the path to where you placed all the libraries from the repository folder *include*
* Build the script using gpp
  ```
  gpp /home/0xdead/src/tools/decipher.src /bin
  gpp decipher.src /bin
  gpp decipher.src .
  ```
* 1. uses absolute paths
* 2. uses the source file relative path and absolute path for output
* 3. uses the source file relative path and current directory for output
* Now you can launch the program from where its built

# Usage
*example.src*
```
myrichtext = core.style.set("gpp rock!","bold;italic").text
streamout = core.io.sout("/home/user/Desktop/Gift.txt",myrichtext)
streamout.write
streamin = core.io.sin("/home/user/Desktop/Gift.txt")
filehandle = streamin.file
print(filehandle.path)
print(streamin.read)
print(core.style.set(core.io.sin("/etc/passwd").read,"color=red;bold;italic").text)

airlib = core.network.airlib("/home/user/metaxploit.so","210.56.160.75","22")
result = airlib.run
print(result_list.buffer)
```

## Creating your own library
*my_lib.src*
```
//lib code
_myclassfunction = function(msg)
	return print(msg)
end function

myclasslib = {"system":{"alert":@_myclassfunction}}
```
*myclasslib* is the exported global name that you can access after including this library in your program

*lib_test_code.src*
```
#/home/user/my_lib.src
myclasslib.system.alert("Hello from my lib!")
```

# Core library functionality
* core.io : used to manage files.
* core.io.sin(filepath) : creates a stream to read a file.
* core.io.sout(filepath,text) : create a stream to write content to a file.
* core.io.gob(filepath): used to load a gobfile and parse it.
* core.io.format(item,itemName,directory,format): used to make a gob file from a map object
* core.style : used to manage text style, colors, bold, italics etc.
* core.style.set(text,style) : used to apply some defined style to text.
* core.network : used to manage networking
* core.network.airlib(metapath,addr,port) : used to remotely scan a target lib for vulnerabilities

## what is gob and how can i use it?
"gob" or "Grey Object" is an external file format much like json or css. It allows you to save data in a structured
way to disk and allow you to parse it back into an object structure in "memory", keeping the structure intact.

### Reading a gob file
```
myGob
somename=gobject
contact=support@gpp.com;
a
somename=gobgob
contact=support@gobgob.com;
```

where *myGob* becomes the key
and something=somevalue are members under the key myGob

using the script *gobtest.src*
```
#core
print(core.io.gob("/home/user/address.gob").parse
```

gives the output
```
{"myGob": {"somename": "gobject", "contact": "support@gpp.com"}, "a": {"aname": "gobgob", "contact": "support@gobgob"}}
```

I use this to save vulnerability data such as what address is exploitable, its buffer overflow value and what type of handle i get from using it
such as computer,file,shell or password reset capabilities. I can then read this information from disk and use it in my automated hacking.

### Writing a gob file
```
#core

myitem = {"sword":{"price":"150","attack":"300"},"potion":{"health":"10"}}
core.io.format(myitem,"inventory","/home/user",".gob")
```

writes the structure to disk that looks like this
```
sword
price=150
attack=300
;
potion
health=10
;
```

# Reading material
You can study the compiler corelib.gs to get a sense of what can be achieved in your own libraries.
My own libraries are based on knowledge i gained by reading the corelib.gs so you can look at those as well.
It's common to see things like _aairlib and _airlib. The first usually denotes an object that represents a class object or library object with its members and functions that you can use on it.
The second is usually a function that uses the defined class or library object and has access to all its member data.
You dont have to have this two way nesting in the exported library object.
Sometimes you simply want to store functions that take parameters directly instead of having a new class or library object that has the functions inside.
See my own libraries for such use of custom library functionality.
