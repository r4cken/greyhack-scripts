#/home/0xdead/include/libs/utils.src
newline = char(10)

iwlist = function()
	lib_utils.io.print.info("-- iwlist v2.0 by r4cken --")
	
	Networks = []
	for network in get_shell.host_computer.wifi_networks("eth0")
		network_info = network.split(" ")
		bssid = network_info[0]
		pwr = network_info[1]
		essid = network_info[2]
		Networks.push({"bssid": bssid, "pwr": pwr, "essid": essid})
	end for
	
	Networks.sort("pwr")
	info = lib_utils.io.apply_color("#FFFFFF", "BSSID PWR ESSID")
	for network in Networks
		output = network.bssid + " " + network.pwr + " " + network.essid
		output = lib_utils.io.apply_color("#f0e44e", output)
		info = info + newline + output
	end for
	print(format_columns(info))
end function

iwlist()
