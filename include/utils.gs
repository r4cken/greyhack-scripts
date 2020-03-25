_library_include_lib = function(library)
	lib = include_lib("/lib/" + library)
	if not lib then
		lib = include_lib(get_shell.host_computer.current_path + "/" + library)
	end if
	if not lib then 
		return false
	end if
	return lib
end function

_library_metalib_info = function(metalib)
	if not metalib then return {"name": "none", "version": "none" }
	return {"name": metalib.lib_name, "version": metalib.version }
end function

_library_include_metalib = function(self, library)
	metaxploit = self.include("metaxploit.so")
	if not metaxploit then return false
	
	metalib = metaxploit.load("/lib/" + library)
	if not metalib then
		metalib = metaxploit.load(get_shell.host_computer.current_path + "/" + library)
	end if
	if not metalib then
		return false
	end if
	return metalib
end function

_io_apply_color = function(hex, text)
	if not hex[0] == "#" then hex = "#" + hex
	if not hex.len == 7 and not hex.len == 9 then return text
	return "<color=" + hex + ">" + text + "</color>"
end function

_io_print_info = function(text)
	color = {"info": "#f0e44e"}
	for line in text.split(char(10)) // newline
		print(_io_apply_color(color.info, line))
	end for
end function

_io_print_error = function(text)
	color = {"error": "#db3437"}
	for line in text.split(char(10))
		print(_io_apply_color(color.error, line))
	end for
end function

_io_print_success = function(text)
	color = {"success": "#4bde5c"}
	for line in text.split(char(10))
		print(_io_apply_color(color.success, line))
	end for
end function

_argparse_get_arg = function(arg)
	rnp=0
	for param in params
		if rnp then return param		
		if param == (arg) then rnp=1
	end for
	return false
end function

_argparse_has_arg = function(arg)
	for param in params
		if param == arg then return true
	end for
	return false
end function

_program_get_name = function()
	return program_path.split("/")[-1]
end function

_program_usage = function(self, text)
	exit("<b>usage: " + self.name + " " + text + "</b>")
end function

_program_exit = function(text)
	_io_print_error(text)
	exit
end function

lib_utils = {"library": {"include": @_library_include_lib, "include_metalib": @_library_include_metalib, "library_information": @_library_metalib_info}, "program": {"name":@_program_get_name, "usage":@_program_usage, "exit": @_program_exit}, "argparse":{"get_arg":@_argparse_get_arg, "has_arg":@_argparse_has_arg}, "io": { "apply_color":@_io_apply_color, "print": {"info": @_io_print_info, "error":@_io_print_error, "success":@_io_print_success}},"classID":"UtilsLib 1.0.0"}