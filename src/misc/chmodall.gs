#/home/0xdead/include/libs/utils.src

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len == 0 then
		lib_utils.program.usage(usage)
	end if
end function

run = function()
	user = lib_utils.argparse.get_arg("-u")
	file = get_shell.host_computer.File(lib_utils.argparse.get_arg("-f"))
	if not file then lib_utils.program.exit("Error: Can't find the specified file.")

	action = lib_utils.argparse.get_arg("-a")
	applyAction = ["u+wrx", "g+wrx", "o+wrx"]
	removeAction = ["u-wrx", "g-wrx", "o-wrx"]

	if action.lower == "apply" then
		action = applyAction
	else if action.lower == "remove" then
		action = removeAction
	else
		lib_utils.program.exit("Error: Unknown action, expected 'apply' or 'remove'")
	end if


	lib_utils.io.print.info("Altering group and r,w,x permissions.")
	file.set_group(user)
	for permission in action
		file.chmod(permission)
	end for
end function

check_usage("[-u (user)] [-f (file] [-a (apply | remove)]")
run()
