#core
#/home/0xdead/include/utils.src
#/home/0xdead/include/crypto.src

check_usage = function(usage)
	if lib_utils.argparse.has_arg("-h") or lib_utils.argparse.has_arg("--help") or params.len == 0 then
		lib_utils.program.usage(usage)
	end if
end function

smtp_user_list = function(ip, port)
	if not is_valid_ip(ip) then lib_utils.program.exit("Error: Invalid ip address")
	lib_crypto.smtp_dump(ip, port)
end function

check_usage("[ip address] [-p (opt port)]")

ip = params[0]
port = lib_utils.argparse.get_arg("-port")
smtp_user_list(ip, port)
