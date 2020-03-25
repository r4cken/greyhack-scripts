if params.len != 2 or params[0] == "-h" or params[0] == "--help" then exit("<b>buildall source_folder destination_folder</b>")

build_all_programs_in_dir = function(current_folder, destination_folder)
	if current_folder.is_folder then
		folders = current_folder.get_folders
		files = current_folder.get_files

		for folder in folders
			build_all_programs_in_dir(get_shell.host_computer.File(folder.path), destination_folder.path)
		end for
		
		for file in files
			if file.name.indexOf(".src") then
				buildArgs = [file.path, destination_folder]
				get_shell.launch("/bin/gpp", buildArgs.join(" "))
			end if
		end for
	end if
end function

source_folder = get_shell.host_computer.File(params[0])
destination_folder = get_shell.host_computer.File(params[1])

if not source_folder.is_folder then	
	exit("Error: the source parameter is not a folder")
end if
if not destination_folder.is_folder then
	exit("Error: the destination parameter is not a folder")
end if

build_all_programs_in_dir(source_folder, destination_folder)
