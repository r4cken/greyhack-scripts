#core
#/home/ellie/include/utils.src

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len == 0 or params.len > 1 then
		lib_utils.program.usage(usage)
	end if
end function

validate_ip = function(ip)
	if not is_valid_ip(ip) then
		lib_utils.program.exit("nmap: invalid ip address")
	end if
end function

get_router_data = function(ip)
	if is_lan_ip(ip) then 
		router = get_router
		ports = router.computer_ports(ip)
		return {"router": router, "ports": ports}
	else
		router = get_router(ip)
		ports = router.used_ports
		return {"router": router, "ports": ports }
	end if
end function

scan_ip = function(ip)
	header = lib_utils.io.apply_color("#FFFFFF", "Interesting ports on " + ip)
	print(header)
	
	TABLE = "PORT STATE SERVICE VERSION LAN"
	TABLE = lib_utils.io.apply_color("#CCCC00", TABLE)
	
	port_states = { 0: "open", 1: "closed" }
	router_data = get_router_data(ip)
	router = router_data.router
	ports = router_data.ports
	
	for port in ports
		port_info = router.port_info(port).split(" ")
		output = [port.port_number, port_states[port.is_closed], port_info[0], port_info[1], port.get_lan_ip].join(" ")
		output = lib_utils.io.apply_color("#CCCC00", output)
		TABLE = TABLE + "\n" + output
	end for
	
	print(format_columns(TABLE))
	print
end function

scan_whole_local_network = function()
	for computer in get_router.computers_lan_ip
		scan_ip(computer)
	end for
end function

check_usage("[ip address] || [-a (scan whole local network)]")

author = "r4cken"
version = "v2.1"
datetime = current_date

// Scan whole local network
if lib_utils.argparse.has_arg("-a") and params[0] == "-a" then
	startup_message = "Starting nmap " + version + " by " + author + " at " + datetime
	startup_message = startup_message + "\n" + "Scanning the entire local network"
	lib_utils.io.print.info(startup_message)
	
	print
	scan_whole_local_network()
else
	//Scan single ip address
	ip = params[0]
	validate_ip(params[0])
	
	startup_message = "Starting nmap " + version + " by " + author + " at " + datetime
	lib_utils.io.print.info(startup_message)
	
	print
	scan_ip(ip)
end if

