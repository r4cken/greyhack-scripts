#/home/0xdead/include/utils.src
#/home/0xdead/include/crypto.src

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len == 0 then
		lib_utils.program.usage(usage)
	end if
end function

run_program = function(arg)
	input = get_shell.host_computer.File(arg)
	// It's not a file, its a user:pass string
	if not input then
		encdata = arg.split(":")
		password = lib_crypto.decipher(encdata)
		if not password then
			lib_utils.io.print.error("Error: No password found")
		end if
		lib_utils.io.print.info(encdata[0] + " => " + password)
	else
		lib_crypto.decipher_file(input)
	end if
end function

check_usage("[(user:pass || file path)]")
arg = params[0]
run_program(arg)
