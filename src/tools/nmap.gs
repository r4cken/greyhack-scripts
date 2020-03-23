#core
#/home/0xdead/include/libs/utils.src

scan_ip = function(ipAddress)
	isLanIp = is_lan_ip( ipAddress )
	if isLanIp then
		router = get_router;
	else 
		router = get_router( ipAddress )
	end if
	
	if router == null then lib_utils.program.exit("nmap: ip address not found")
	
	isRouterIp = router.local_ip == ipAddress
	ports = null
	
	if not isLanIp or isRouterIp then
		ports = router.used_ports
	else
		ports = router.computer_ports(ipAddress)
	end if
	
	if ports == null then lib_utils.program.exit("nmap: ip address not found")
	
	info = "PORT STATE SERVICE VERSION LAN"
	print(core.style.set("Interesting ports on " + ipAddress, "color=#ffffff").text)
	
	for port in ports
		service_info = router.port_info(port)
		lan_ips = port.get_lan_ip
		port_status = "open"
		
		if(port.is_closed and not isLanIp) then
			port_status = "closed"
		end if
		info = info + "\n" + port.port_number + " " + port_status + " " + service_info + " " + lan_ips
	end for
	print(format_columns(info) + "\n")
end function

scan_whole_local_net = function()
	for local_ip in get_router.computers_lan_ip
		scan_ip(local_ip)
	end for
end function

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len != 1 then
		lib_utils.program.usage(usage)
	end if
end function

run_program = function()
	lib_utils.io.print.info("Starting nmap v2.1 by r4cken at " + current_date)
	// Scan whole local network
	if lib_utils.argparse.has_arg("-a") and params[0] == "-a" then
		scan_whole_local_net()
	else
		//Scan single ip address
		ipAddress = params[0]	
		scan_ip(ipAddress)
	end if
end function

check_usage("[ip address] || [-a (whole local network)]")
if not get_shell.host_computer.is_network_active then lib_utils.program.exit("nmap: can't connect. No internet access.")
run_program()

