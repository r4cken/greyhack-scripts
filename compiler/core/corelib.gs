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
		gob = thisGob.trim.split(char(10)) // newline
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
	return {"gobPath":gobPath,"parse":@_gob,"ClassID":"Core.Io.GobFile.Object"}
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
		gobContent = gobContent + Oindex + char(10) // newline
		for Cindex in indexClassMap
			gobContent = gobContent + Cindex + "=" + object[Oindex][Cindex] + char(10) // newline
			if Cindex == indexClassMap[indexClassMap.len -1] then
				gobContent = gobContent + ";" + char(10) // newline
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
		if nslookup(self.addr) != nslookup("#") and port then
			target = metalib.net_use(nslookup(self.addr),self.port.to_int).dump_lib
		else if is_valid_ip(self.addr) then
			if self.port then
				target = metalib.net_use(self.addr,self.port.to_int).dump_lib
			else
				target = metalib.net_use(self.addr).dump_lib
			end if
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