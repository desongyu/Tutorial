#!/bin/sh

if [ $# -eq 0 ]
then 
    echo "Default Option: Running All Roles"
    ansible-playbook -i hosts -vvv services.yml
elif [ $1 = "-h" ];
then
    echo "This script is to run ansible with express option"
    echo " -exp : run Ansible with all the tasks with tag 'infrequent' excluded"
elif [ $1 = "-exp" ]; 
then
    echo "Express Option: Running Rolls Excluding Tag=Infrequent"
    ansible-playbook --skip-tags "infrequent" -i hosts -vvv services.yml
else
    echo "Unrecognized Option: Please use -h for help"
fi
