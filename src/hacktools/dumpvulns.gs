#core
#/home/0xdead/include/utils.src

find_valid_vulns = function(metapath, ip, port)
	airlib = core.network.airlib(metapath, ip, port)
	vulnerabilities = airlib.run.buffer
	Exploits = {}
	// Setup json structure
	for vuln in vulnerabilities
		address = vuln.split(" ")[0]
		if not Exploits.hasIndex(address) then
			Exploits[address] = []
		end if
	end for

	for vuln in vulnerabilities
		address = vuln.split(" ")[0]
		buffer = vuln.split(" ")[1]
		type = vuln.split(" ")[2]
		Exploits[address].push({"buffer": buffer, "type": type})
	end for

	if port then
		fileName = ip + "-" + port
	else
		fileName = ip + "-" + 0
	end if
	save_to_disk(fileName, Exploits)
end function

save_to_disk = function(fileName, exploits)
	computer = get_shell.host_computer
	pathName = home_dir + "/targets"
	if not computer.File(pathName) then
		computer.create_folder(home_dir, "targets")
	end if
	streamout = core.io.sout(pathName + "/" + fileName, exploits)
	streamout.write
end function

metapath = "/lib/metaxploit.so"
ip = lib_utils.argparse.get_arg("-ip")
port = lib_utils.argparse.get_arg("-port")

if not port and not ip or params.len == 0 then
	lib_utils.program.usage("[-ip] [-port]")
end if

dump_valid_vulns(metapath, ip, port)