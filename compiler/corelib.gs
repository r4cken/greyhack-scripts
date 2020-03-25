//Core library - These are the built-in libraries and functions that are shipped with the compiler suite.

//iolib #filesystem#
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

_sfile = function(self)
	if typeof(get_shell.host_computer.File(self.dir)) == "file" then
		if get_shell.host_computer.File(self.dir).is_binary then
			return null
		else
			return get_shell.host_computer.File(self.dir)
		end if
	else
		return null
	end if
end function

_sin = function(self)
	if typeof(get_shell.host_computer.File(self.dir)) == "file" then
		if get_shell.host_computer.File(self.dir).is_binary then
			return null
		else
			return get_shell.host_computer.File(self.dir).content
		end if
	else
		return null
	end if
end function

_ssin = function(dir)
	return {"dir":dir,"read":@_sin,"file_handle":@_sfile,"classID":"Core.Io.Stream.In.Object"}
end function

//json to string 
_json_toString = function(text)
	//removing hided character, especially tabs.
	removeTab = function(text)
		cleanedText = ""
		for c in text
			if code(c) != 9 and code(c) != 10 then
				cleanedText = cleanedText + c
			end if
		end for
		return cleanedText
	end function
	
	json = removeTab(text)
	jstring = ""
	
	index = 0
	roof = jstring.len - 1
	for j in json
		if index != 0 and index != roof then
			jstring = jstring + j
		end if
		index = index + 1
	end for
	return jstring
end function

//json parser, this return an object.The json parser works in a big
//recursion and parse character by character.The parse take the user json
//script and build an object out of it.
_json_parse = function(plain_json,jObject,isValues)
	//a string , a int , a map or a list.The values name:"values" are send into
	//the according function below.
	
	add_string = function(str)
		return str.replace("""","")
	end function
	
	add_int = function(int)
		return int.to_int
	end function
	
	add_map = function(str)
		struct = {}
		map = _json_parse(str,struct,false)
		return map
	end function
	
	add_list = function(str)
		struct = []
		list = _json_parse(str,struct,true)
		return list
	end function
	
	//variables default values
	jstring = _json_toString(plain_json)
	currentItem = ""
	keyword = ""
	
	itemName = ""
	if isValues == false then
		isItemName = true
	else if isValues == true then
		isItemName = false
	end if
	
	isStr = false
	isMap = false
	isList = false
	isInt = false
	isNested = false
	nestIndex = 0
	
	//parsing the user code under string form
	for c in jstring
		//determine if the current item is a value or a name.
		if isItemName == false then
			//determine wich type of value it is
			if isStr == false and isMap == false and isList == false and isInt == false then
				if c == """" then
					isStr = true
					keyword = "str"
					c = "±"
				else if c == "{" then
					isMap = true
					keyword = "map"
					c = "+"
				else if c == "[" then
					isList = true
					keyword = "list"
					c = "±"
				else if typeof(c.to_int) == "number" then
					isInt = true
					keyword = "int"
				end if
			end if
		else if isItemName == true then
			//assemble name
			itemName = itemName + c
			if c == ":" then
				itemName = itemName.replace(",","").replace(":","").trim
				// Json keys are denoted with quotes, we strip them so that the
				// inserted itemName key is a string, and the json file keeps its key shape
				itemName = itemName.replace("""", "").trim
				isItemName = false
			end if
		end if
		
		//Depending of the item type , create the object.
		if isStr == true then
			if keyword == "str" then
				currentItem = currentItem + c
				if c == """" then
					currentItem = currentItem.replace("±","""")
					if typeof(jObject) == "map" then
						jObject[itemName] = add_string(currentItem)
						isItemName = true
					else if typeof(jObject) == "list" then
						jObject.push(add_string(currentItem))
					end if
					keyword = ""
					currentItem = ""
					isStr = false
					itemName = ""
				end if
			end if 
		else if isMap == true then
			if keyword == "map" then
				currentItem = currentItem + c
				if c == "}" then 
					if isNested == false then
						if typeof(jObject) == "map" then
							jObject[itemName] = add_map(currentItem)
							isItemName = true
						else if typeof(jObject) == "list" then
							jObject.push(add_map(currentItem))
						end if
						keyword = ""
						currentItem = ""
						isMap = false
						itemName = ""
					else if isNested == true then
						nestIndex = nestIndex - 1
						if nestIndex == 0 then
							isNested = false
						end if
					end if
				else if c == "{" then
					if isNested == true then
						nestIndex = nestIndex + 1
					else if isNested == false then
						nestIndex = 1
					end if
					isNested = true
				end if
			end if
		else if isList == true then
			if keyword == "list" then
				currentItem = currentItem + c
				if c == "]" then
					if isNested == false then
						if typeof(jObject) == "map" then
							jObject[itemName] = add_list(currentItem)
							isItemName = true
						else if typeof(jObject) == "list" then
							jObject.push(add_list(currentItem))
						end if
						keyword = ""
						currentItem = ""
						isList = false
						itemName = ""
					else if isNested == true then
						nestIndex = nestIndex - 1
						if nestIndex == 0 then
							isNested = false
						end if
					end if
				else if c == "[" then
					if isNested == true then
						nestIndex = nestIndex + 1
					else if isNested == false then
						nestIndex = 1
					end if
					isNested = true
				end if
			end if
		else if isInt == true then
			if keyword == "int" then
				if typeof(c.to_int) == "number" then
					currentItem = currentItem + c
				else
					if typeof(jObject) == "map" then
						jObject[itemName] = add_int(currentItem)
						isItemName = true
					else if typeof(jObject) == "list" then
						jObject.push(add_int(currentItem))
					end if
					keyword = ""
					currentItem = ""
					isInt = false
					itemName = ""
				end if
			end if
		end if
	end for
	
	//the user code is parsed and ready to be returned
	return jObject
end function

_json_read = function(self)
	json_streamin = _ssin(self.jsonPath).read
	if not json_streamin then return false
	jObject = {}
	json = _json_parse(json_streamin, jObject, false)
	if not json then return false
	return json
end function

_jjson = function(jsonPath)
	return {"jsonPath":jsonPath,"read":@_json_read,"ClassID":"Core.Io.Json.Object"}
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

//Library objects
core = {"io":{"sout":@_ssout,"sin":@_ssin},"json":@_jjson,"style":{"set":@_style},"network":{"airlib":@_aairlib},"classID":"CoreLib 2.2.0"}
