# ! /bin/bash
#Directory for the script being used to execute the backend
script_loc="test"
#User that is executing the script, you likely dont want this to be root
linux_user="test"
#Directory where systemd is looking for its service files
service_directory="./"
#Name of the file, you can rename it to whatever you want
file_name="test.txt"

filename="COPProjectPHP.templservice"
if [ -e "$filename" ]; then
  #Reads and replaces from template file
  content=$(cat "$filename")
  content=${content//\$Binary/$script_loc}
  content=${content//\$User/$linux_user}
  #systemd service dir is root or admin only thus it is needed
  sudo echo "$content" > "$service_directory$file_name.service"
  sudo systemctl deamon-reload
  sudo systemctl start "$file_name.service"
  
else 
  echo "File not found: $filename"
fi 

