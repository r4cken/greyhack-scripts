#/home/ellie/include/utils.src
#/home/ellie/include/metaxploit.src

scan = function()
	metaxploit = lib_utils.library.include("metaxploit.so")
	location = lib_utils.argparse.get_arg("-input")
	port = lib_utils.argparse.get_arg("-port")
	save = lib_utils.argparse.has_arg("-save")
	metalib = null
	
	// Load remote or local library
	if is_valid_ip(location) then
		// get dump lib
		metalib = lib_metaxploit.establish_connection(location, port)
		if not metalib then lib_utils.program.exit("Error: Can't establish a net session")
	else
		metalib = lib_metaxploit.get_metalib(location)
		if not metalib then lib_utils.program.exit("Error: Can't retrieve the requested metalib")
	end if
	
	metalib_info = lib_utils.library.library_information(metalib)
	lib_utils.io.print.info("Scanning " + metalib_info.name + " version " + metalib_info.version)
	
	vulnerabilities = metaxploit.scan(metalib)
	if not vulnerabilities then lib_utils.program.exit("Error: Found no vulnerable memory locations in metalib library")

	Export = {}
	for addr in vulnerabilities
		exploit = {"addr": addr, "unsafevalues": [], "toString": []}
		info = metaxploit.scan_address(metalib, addr)
		info = info.remove("decompiling source...").remove("searching unsecure values...")
		info = info[2:]
		while info.indexOf("Unsafe check: ") != null or info.indexOf("<b>") != null or info.indexOf("</b>") != null
			info = info.remove("Unsafe check: ").remove("<b>").remove("</b>")
		end while
		while info.indexOf("loop in array ") != null
			info = info.replace("loop in array ", "<tag>")
		end while
		while info.indexOf("string copy in ") != null
			info = info.replace("string copy in ", "<tag>")
		end while
		// Build the list of addr : unsafeval
		while info.indexOf("<tag>") != null
			a = info.indexOf("<tag>") + 5
			info = info.remove(info[:a])
			unsafeval = info[:info.indexOf(".")]
			exploit.unsafevalues.push(unsafeval)
			exploit.toString.push(addr + " " + unsafeval)
		end while
		Export.push(exploit)
	end for
	
	if save then
		computer = get_shell.host_computer
		pathName = home_dir + "/vulnerabilities"
		fileName = metalib_info.name + "." + metalib_info.version
		
		if not computer.File(pathName) then
			computer.create_folder(home_dir, "vulnerabilities")
		end if
		
		if not computer.touch(pathName, fileName) then 
			lib_utils.program.exit("Unable to create vulnerabilties analysis file")
		end if
	
		outFile = computer.File(pathName + "/" + fileName)
		if outFile then
			asString = ""
			for exploit in Export
				for string in exploit.key.toString
					asString = asString + string + "
"
				end for
			end for				
			outFile.set_content(asString)
			lib_utils.io.print.info("Wrote the analysis of " + vulnerabilities.len + " memory location(s) to file " + outFile.path)
		end if
	else
		lib_utils.io.print.info("Found " + vulnerabilities.len + " vulnerable memory location(s)")
		for exploit in Export
			lib_utils.io.print.info(exploit.key.addr + ":")
			for unsafeval in exploit.key.unsafevalues
				lib_utils.io.print.info(unsafeval)
			end for
			print
		end for
	end if
end function

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len == 0 or not lib_utils.argparse.has_arg("-input") then
		lib_utils.program.usage(usage)
	end if
end function

check_usage("Usage: [-input (metalib name || ip address)] [-port (if using ip address)] [-save (opt save scan to disk)]")
scan()


