_metaxploit_get_dependency = function(self, dependency)
	if dependency == "metaxploit.so" then
		if not self.metaxploit then
			self.metaxploit = _metaxploit_load_metaxploit()
			return self.metaxploit
		else
			return self.metaxploit
		end if
	else if dependency == "lib_utils" then
		if not self.lib_utils then
			self.lib_utils = _metaxploit_load_lib_utils()
			return self.lib_utils
		else
			return self.lib_utils
		end if
	end if
end function

_metaxploit_load_lib_utils = function()
	// lib_utils is loaded
	if globals.hasIndex("lib_utils") and globals.lib_utils then
		return globals.lib_utils
	else 
		exit("Error: lib_utils dependency missing")
	end if
end function

_metaxploit_load_metaxploit = function(self)
	metaxploit = include_lib("/lib/metaxploit.so")
	if not metaxploit then 
		metaxploit = include_lib(get_shell.host_computer.current_path + "/metaxploit.so")
	end if
	if not metaxploit then exit("Error: Can't load metaxploit.so")
	return metaxploit
end function

// Returns the metalib on success
_metaxploit_establish_connection = function(self, ip, port)
	metaxploit = self.dependencies.get_dependency("metaxploit.so")
	if is_valid_ip(ip) then
		if port then
			print("metexploit establish_connection")
			net_session = metaxploit.net_use(ip, port.to_int)
		else
			net_session = metaxploit.net_use(ip)
		end if
		if not net_session then return false
		return net_session.dump_lib
	else
		return false
	end if
end function

// get metalib using metaxploit.load(metalib name)
_metaxploit_get_metalib = function(self, metalib_name)
	if metalib_name then
		metaxploit = self.dependencies.get_dependency("metaxploit.so")
		metalib = metaxploit.load("/lib/" + metalib_name)
		if not metalib then 
			metalib = metaxploit.load(get_shell.host_computer.current_path + "/" + metalib_name)
		end if
		return metalib
	else
		return false
	end if
end function

_metaxploit_metalib_info = function(metalib)
	if not metalib then return {"name": "none", "version": "none" }
	return {"name": metalib.lib_name, "version": metalib.version }
end function

_metaxploit_execute_exploit = function(exploit_target, addr, unsafeval, optarg)
	result = null
	
	if addr and unsafeval then
		if optarg then
			result = exploit_target.overflow(addr, unsafeval, optarg)
		else
			result = exploit_target.overflow(addr, unsafeval)
		end if
	else
		return false
	end if
	
	return result
end function

lib_metaxploit = {"dependencies": {"lib_utils": false, "metaxploit": false, "get_dependency": @_metaxploit_get_dependency }, "establish_connection": @_metaxploit_establish_connection, "get_metalib": @_metaxploit_get_metalib, "get_metalib_info": @_metaxploit_metalib_info, "execute_exploit": @_metaxploit_execute_exploit}