#/home/0xdead/include/libs/utils.src
#/home/0xdead/include/libs/crypto.src

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

check_usage("[-input (user:pass || file path)]")
arg = lib_utils.argparse.get_arg("-input")
run_program(arg)
