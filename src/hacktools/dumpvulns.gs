#core
#/home/0xdead/include/libs/utils.src

dump_valid_vulns = function(metapath, ip, port)
	airlib = core.network.airlib(metapath, ip, port)
	vulnerabilities = airlib.run.buffer
	print(core.style.set("Valid exploits found...", "color=#ffffff").text)
	Exploits = {}
	
	// Setup gob keys
	for vuln in vulnerabilities
		address = vuln.split(" ")[0]
		if not Exploits.hasIndex(address) then
			Exploits[address] = {}
		end if
	end for

	// Gob content for key
	for vuln in vulnerabilities
		address = vuln.split(" ")[0]
		buffer = vuln.split(" ")[1]
		type = vuln.split(" ")[2]
		Exploits[address][buffer] = type
	end for
	
	fileName = ip + "-" + port
	save_to_disk(fileName, Exploits)
end function

save_to_disk = function(fileName, exploits)
	computer = get_shell.host_computer
	pathName = home_dir + "/targets"
	if not computer.File(pathName) then
		computer.create_folder(home_dir, "targets")
	end if
	core.io.format(exploits, fileName, pathName, ".gob")
end function

metapath = "/lib/metaxploit.so"
ip = lib_utils.argparse.get_arg("-ip")
port = lib_utils.argparse.get_arg("-port")

if not port and not ip or params.len == 0 then
	lib_utils.program.usage("[-ip] [-port]")
end if

dump_valid_vulns(metapath, ip, port)



