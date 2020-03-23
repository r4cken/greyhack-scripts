//Built-in Libs, this is where built-in libs are constructed.They
//come in two part the plain code is for th compiler itself.
//The second part is for the user code.Libs are called through user
//code using # symbol as key #mylib.Those are called pre-processor, the
//pre-processor work like any other language.They have to be put line by 
//line and only one by line, if not the user will have build errors.

//iolib #filesystem#
_sfile = function(self)
	if typeof(get_shell.host_computer.File(self.dir)) == "file" then
		return get_shell.host_computer.File(self.dir)
	end if
end function

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
	return {"dir":dir,"text":text,"write":@_sout,"file":@_sfile,"classID":"Core.Io.Stream.Out.Object"}
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
	return {"dir":dir,"read":@_sin,"file":@_sfile,"classID":"Core.Io.Stream.In.Object"}
end function

_gob = function(self)
	if typeof(get_shell.host_computer.File(self.gobPath)) == "file" then
		if get_shell.host_computer.File(self.gobPath).is_folder then 
			return null
		else
			if get_shell.host_computer.File(self.gobPath).is_binary then
				return null
			else
				myGob = get_shell.host_computer.File(self.gobPath).content.trim.split(";")
			end if
		end if
	else
		return null
	end if
	
	ob = {}
	obName = ""
	for thisGob in myGob
		gob = thisGob.trim.split("\n")
		for g in gob
			if g.len > 0 then
				if g == gob[0] then
					ob[g.trim] = {}
					obName = g
				else
					gobVal = g.trim.split("=")
					ob[obName][gobVal[0].trim] = gobVal[1].trim
				end if
			end if
		end for
	end for
	return ob
end function

_ggob = function(gobPath)
	return {"gobFile":gobPath,"parse":@_gob,"ClassID":"Core.Io.GobFile.Object"}
end function

_makeGob = function(object,filename,directory)
	if typeof(get_shell.host_computer.File(directory)) == "file" then
		if get_shell.host_computer.File(directory).is_folder then
			//directory is a conform folder
		else
			return null
		end if
	else
		return null
	end if
	
	indexObjectMap = object.indexes
	indexClassMap = ""
	gobContent = ""
	filepath = directory + "/" + filename
	get_shell.host_computer.touch(directory,filename)
	
	for Oindex in indexObjectMap
		indexClassMap = object[Oindex].indexes
		gobContent = gobContent + Oindex + "\n"
		for Cindex in indexClassMap
			gobContent = gobContent + Cindex + "=" + object[Oindex][Cindex] + "\n"
			if Cindex == indexClassMap[indexClassMap.len -1] then
				gobContent = gobContent + ";\n"
			end if
		end for
	end for
	return get_shell.host_computer.File(filepath).set_content(gobContent)
end function

_format = function(item,itemName,directory,format)
	if format == ".gob" then
		if typeof(item) == "map" then
			_makeGob(item,itemName,directory)
		else
			return null
		end if
	else
		return null
	end if
end function

//stylelib #richtext#
_style = function(text,options)
	opt = options.split(";")
	if opt.len > 0 then
		for o in opt
			if o.len > 0 then
				if o.trim == "bold" then
					text = "<b>" + text + "</b>"
				else if o.trim == "italic" then
					text = "<i>" + text + "</i>"
				else if o.trim.indexOf("=") then
					v = o.trim.split("=")
					if v[0] == "size" then
						if typeof(v[1].to_int) == "number" then
							text = "<size=" + v[1] + ">" + text + "</size>"
						end if
					else if v[0] == "color" then
						if v[1].len > 0 then
							text = "<color=" + v[1] + ">" + text + "</color>"
						end if
					end if
				end if
			end if
		end for	
	end if
	return {"text":text,"classID":"Core.Style.Text.Object"}
end function

//networklib #networking#
_airlib = function(self)
	metalib = include_lib(self.metapath)
	exploits = []
	if not typeof(metalib) == null then
		target = ""
		if nslookup(self.addr) != nslookup("#") then
			target = metalib.net_use(nslookup(self.addr),self.port.to_int).dump_lib
		else if is_valid_ip(self.addr) then
			target = metalib.net_use(self.addr,self.port.to_int).dump_lib
		else
			return null
		end if
		if typeof(target) == "MetaLib" then
			memory = metalib.scan(target)
			for m in range(0,memory.len)
				maddr = metalib.scan_address(target,memory[m-1])
				cipher = maddr.split(" ")
				for c in cipher
					b = c.replace("<b>","#").replace("</b>","#")
					if b.indexOf("#") != null then
						buff = b.replace("#","").replace(".","")
						over = target.overflow(memory[m-1],buff,"airlib")
						if typeof(over) != "null" then
							xStr = memory[m-1] + " " + buff + " " + typeof(over)
							if exploits.len == 0 then
								exploits.push(xStr)
							else
								if xStr != exploits[exploits.len - 1] then
									exploits.push(xStr)
								end if
							end if
						end if
					end if
				end for
			end for
			return {"buffer":exploits,"classID":"Core.Network.Lib.Scan.List.Object"}
		end if
	else
		return null
	end if
end function

_aairlib = function(metapath,addr,port)
	return {"metapath":metapath,"addr":addr,"port":port,"run":@_airlib,"classID":"Core.Network.Lib.Scan.Object"}
end function

//Lib Objects
core = {"io":{"sout":@_ssout,"sin":@_ssin,"gob":@_ggob,"format":@_format},"style":{"set":@_style},"network":{"airlib":@_aairlib},"classID":"CoreLib 2.1.9"}

//Lib Strings
strSout = "\n_sout = function(self)\nif typeof(get_shell.host_computer.File(self.dir)) == ""file"" then\nreturn get_shell.host_computer.File(self.dir).set_content(self.text)\nelse\ndirParser = self.dir.split(""/"")\nfilename = dirParser[dirParser.len - 1]\ndirParser[dirParser.len -1] = """"\nfilepath = """"\nfor p in dirParser\nif p.len > 0 then\nfilepath = filepath + ""/"" + p\nend if\nend for\nget_shell.host_computer.touch(filepath,filename)\nif typeof(get_shell.host_computer.File(self.dir)) == ""file"" then\nreturn get_shell.host_computer.File(self.dir).set_content(self.text)\nelse\nreturn null\nend if\nend if\nend function\n_ssout = function(dir,text)\nreturn {""dir"":dir,""text"":text,""write"":@_sout,""classID"":""Core.Io.Stream.Out.Object""}\nend function"
strSin = "\n_sin = function(self)\nif typeof(get_shell.host_computer.File(self.dir)) == ""file"" then\nif get_shell.host_computer.File(self.dir).is_binary then\nreturn null\nelse\nreturn get_shell.host_computer.File(self.dir).content\nend if\nend if\nend function\n_ssin = function(dir)\nreturn {""dir"":dir,""read"":@_sin,""classID"":""Core.Io.Stream.In.Object""}\nend function"
strGob = "\n_gob = function(self)\nif typeof(get_shell.host_computer.File(self.gobFile)) == ""file"" then\nif get_shell.host_computer.File(self.gobFile).is_folder then \nreturn null\nelse\nif get_shell.host_computer.File(self.gobFile).is_binary then\nreturn null\nelse\n//File is a conform text file\nend if\nend if\nelse\nreturn null\nend if\nmyGob = get_shell.host_computer.File(self.gobFile).content.trim.split("";"")\nob = {}\nobName = """"\nfor thisGob in myGob\ngob = thisGob.trim.split(""\n"")\nfor g in gob\nif g.len > 0 then\nif g == gob[0] then\nob[g.trim] = {}\nobName = g\nelse\ngobVal = g.trim.split(""="")\nob[obName][gobVal[0].trim] = gobVal[1].trim\nend if\nend if\nend for\nend for\nreturn ob\nend function\n_ggob = function(gobFile)\nreturn {""gobFile"":gobFile,""parse"":@_gob,""ClassID"":""Core.Io.GobFile.Object""}\nend function"
strStyle = "\n_style = function(text,options)\nopt = options.split("";"")\nif opt.len > 0 then\nfor o in opt\nif o.len > 0 then\nif o.trim == ""bold"" then\ntext = ""<b>"" + text + ""</b>""\nelse if o.trim == ""italic"" then\ntext = ""<i>"" + text + ""</i>""\nelse if o.trim.indexOf(""="") then\nv = o.trim.split(""="")\nif v[0] == ""size"" then\nif typeof(v[1].to_int) == ""number"" then\ntext = ""<size="" + v[1] + "">"" + text + ""</size>""\nend if\nelse if v[0] == ""color"" then\nif v[1].len > 0 then\ntext = ""<color="" + v[1] + "">"" + text + ""</color>""\nend if\nend if\nend if\nend if\nend for\nend if\nreturn {""text"":text,""classID"":""Core.Style.Text.Object""}\nend function"
strAirlib = "\n_airlib = function(self)\nmetalib = include_lib(self.metapath)\nexploits = []\nif not typeof(metalib) == null then\ntarget = """"\nif nslookup(self.addr) != nslookup(""#"") then\ntarget = metalib.net_use(nslookup(self.addr),self.port.to_int).dump_lib\nelse if is_valid_ip(self.addr) then\ntarget = metalib.net_use(self.addr,self.port.to_int).dump_lib\nelse\nreturn null\nend if\nif typeof(target) == ""MetaLib"" then\nmemory = metalib.scan(target)\nfor m in range(0,memory.len)\nmaddr = metalib.scan_address(target,memory[m-1])\ncipher = maddr.split("" "")\nfor c in cipher\nb = c.replace(""<b>"",""#"").replace(""</b>"",""#"")\nif b.indexOf(""#"") != null then\nbuff = b.replace(""#"","""").replace(""."","""")\nover = target.overflow(memory[m-1],buff,""airlib"")\nif typeof(over) != ""null"" then\nxStr = memory[m-1] + "" "" + buff + "" "" + typeof(over)\nif exploits.len == 0 then\nexploits.push(xStr)\nelse\nif xStr != exploits[exploits.len - 1] then\nexploits.push(xStr)\nend if\nend if\nend if\nend if\nend for\nend for\nreturn {""buffer"":exploits,""classID"":""Core.Network.Lib.Scan.List.Object""}\nend if\nelse\nreturn null\nend if\nend function\n_aairlib = function(metapath,addr,port)\nreturn {""metapath"":metapath,""addr"":addr,""port"":port,""run"":@_airlib,""classID"":""Core.Network.Lib.Scan.Object""}\nend function"
strMakeGob = "\n_makeGob = function(object,filename,directory)\nif typeof(get_shell.host_computer.File(directory)) == ""file"" then\nif get_shell.host_computer.File(directory).is_folder then\n//directory is a conform folder\nelse\nreturn null\nend if\nelse\nreturn null\nend if\nindexObjectMap = object.indexes\nindexClassMap = """"\ngobContent = """"\nfilepath = directory + ""/"" + filename\nget_shell.host_computer.touch(directory,filename)\nfor Oindex in indexObjectMap\nindexClassMap = object[Oindex].indexes\ngobContent = gobContent + Oindex + ""\n""\nfor Cindex in indexClassMap\ngobContent = gobContent + Cindex + ""="" + object[Oindex][Cindex] + ""\n""\nif Cindex == indexClassMap[indexClassMap.len -1] then\ngobContent = gobContent + "";\n""\nend if\nend for\nend for\nreturn get_shell.host_computer.File(filepath).set_content(gobContent)\nend function"
strFormat = "\n_format = function(item,itemName,directory,format)\nif format == "".gob"" then\nif typeof(item) == ""map"" then\n_makeGob(item,itemName,directory)\nelse\nreturn null\nend if\nelse\nreturn null\nend if\nend function"
strCore = "\ncore = {""io"":{""sout"":@_ssout,""sin"":@_ssin,""gob"":@_ggob,""format"":@_format},""style"":{""set"":@_style},""network"":{""airlib"":@_aairlib},""classID"":""CoreLib 2.1.9""}" 
strCoreLib = strSout + strSin + strGob + strStyle + strAirlib + strMakeGob + strFormat + strCore

//args parser
args = params
if args.len != 2 then exit("gpp.exe [source fullname] [build path].")
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
		fc = []
		if line.len > 0 then
			for l in line
				fc.push(l)
			end for
			if fc[0] == "#" then
				if line == "#core" then
					if core_isCalled == false then
						lib_code = lib_code + "\n" + strCoreLib
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

print(get_shell.build(args[0],args[1]))
//reset the source code to it's orginal content
streamout.text = unclean_code
streamout.write
