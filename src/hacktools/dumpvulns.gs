#core
#/home/0xdead/include/libs/utils.src

dump_valid_vulns = function(metapath, ip, port)
	airlib = core.network.airlib(metapath, ip, port)
	vulnerabilities = airlib.run.buffer
	print(core.style.set("Valid exploits found...", "color=#ffffff").text)
	Exploits = {}

	i = 0
	for vuln in vulnerabilities
		address = vuln.split(" ")[0]
		buffer = vuln.split(" ")[1]
		type = vuln.split(" ")[2]	
		Exploits[i] = {"target":{"ip": ip, "port": port}, "exploit": {"addr": address, "buff": buffer, "type": type}}
		i = i + 1
		print(core.style.set(vuln, "color=yellow").text)
	end for
	lib_utils.io.print.info("Saving information to disk...")
	save_to_disk(Exploits)
end function

save_to_disk = function(exploit_map)
	computer = get_shell.host_computer
	pathName = home_dir + "/targets"
	fileName = exploit_map[0].target.ip + "." + exploit_map[0].target.port + ".gob"
	core.io.format(exploit_map, fileName, pathName, ".gob")
end function

metapath = "/lib/metaxploit.so"
ip = lib_utils.argparse.get_arg("-ip")
port = lib_utils.argparse.get_arg("-port")

if not port and not ip or params.len == 0 then
	lib_utils.program.usage("[-ip] [-port]")
end if

dump_valid_vulns(metapath, ip, port)
