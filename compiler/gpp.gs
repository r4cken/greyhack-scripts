//------------------------------------------------------------------------------
_sout = function(self)
	if typeof(get_shell.host_computer.File(self.dir)) == "file" then
		return get_shell.host_computer.File(self.dir).set_content(self.text)
	else
		dirParser = self.dir.split("/")
		filename = dirParser[dirParser.len - 1]
		dirParser[dirParser.len -1] = ""
		filepath = ""
		
		for p in dirParser
			if p.len > 0 then
				filepath = filepath + "/" + p
			end if
		end for
		
		get_shell.host_computer.touch(filepath,filename)
		if typeof(get_shell.host_computer.File(self.dir)) == "file" then
			return get_shell.host_computer.File(self.dir).set_content(self.text)
		else
			return null
		end if
	end if
end function

_ssout = function(dir,text)
	return {"dir":dir,"text":text,"write":@_sout,"classID":"Core.Io.Stream.Out.Object"}
end function

_sin = function(self)
	if typeof(get_shell.host_computer.File(self.dir)) == "file" then
		if get_shell.host_computer.File(self.dir).is_binary then
			return null
		else
			return get_shell.host_computer.File(self.dir).content
		end if
	end if
end function

_ssin = function(dir)
	return {"dir":dir,"read":@_sin,"classID":"Core.Io.Stream.In.Object"}
end function
//------------------------------------------------------------------------------
//minimum req from core lib included above to support the compiler itself
core = {"io":{"sout":@_ssout,"sin":@_ssin},"classID":"CoreLib 2.1.9"}

//args parser
args = params
if args.len != 2 then exit("gpp.exe [source fullname] [build path].")

// Do we have the needed compiler core lib?
core_lib = get_shell.host_computer.File("/lib/corelib.src")
if not typeof(core_lib) == "file" then
	exit("gpp.exe > missing compiler core library /lib/corelib.src")
end if

if not typeof(get_shell.host_computer.File(args[0])) == "file" then
	exit("gpp.exe > " + args[0] + " could not be found.")
else
	// If we have a relative file path for args[0]
	if not args[0].indexOf("/") then
		args[0] = get_shell.host_computer.current_path + "/" + args[0]
	end if
	
	if get_shell.host_computer.File(args[0]).is_binary then
		exit("gpp.exe > " + args[0] + " is a binary.")
	else
		// build in present working dir
		if args[1] == "." then
			args[1] = get_shell.host_computer.current_path
		end if
		
		if not typeof(get_shell.host_computer.File(args[1])) == "file" then
			exit("gpp.exe > " + args[1] + " cannot be found.")
		else
			if get_shell.host_computer.File(args[1]).is_folder then
				//parser succesful and file and folder confirmed.
			else
				exit("gpp.exe > " + args[1] + " is not a folder.")
			end if
		end if
	end if
end if

//parsing the content & building it.
streamin = core.io.sin(args[0])
source = streamin.read

if source.len > 0 then
	unclean_code = source
	clean_code = ""
	lib_code = ""
	code = ""
	core_isCalled = false
	
	for line in unclean_code.split("\n")
		if line.len > 0 then
			if line[0] == "#" then
				if line == "#core" then
					if core_isCalled == false then
						lib_code = lib_code + "\n" + core_lib.content
						core_isCalled = true
					end if
				else
					l = line.replace("#","")
					streamin.dir = l
					custom_lib = streamin.read
					if custom_lib.len > 0 then
						lib_code = lib_code + "\n" + custom_lib
					end if
				end if
			else
				clean_code = clean_code + "\n" + line
			end if
		end if
	end for
else 
	exit("gpp.exe > " + params[0] + " is empty, g++ cannot compile empty code.")
end if

code = lib_code + "\n" + clean_code

streamout = core.io.sout(args[0],code)
streamout.write

get_shell.build(args[0],args[1])
//reset the source code to it's orginal content
streamout.text = unclean_code
streamout.write