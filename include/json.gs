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
		map = self.parse(str,struct,false)
		return map
	end function
	
	add_list = function(str)
		struct = []
		list = self.parse(str,struct,true)
		return list
	end function
	
	//variables default values
	jstring = self.toString(plain_json)
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
				// Json keys are denoted with quotes, we strip away them so that 
				// the inserted itemName key is still a string
				// but the original json file still keeps them
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
	
	return jObject
end function

lib_json = {"parse":@_json_parse,"toString":@_json_toString, "classID":"JsonLib 1.0.0"}
