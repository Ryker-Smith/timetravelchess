#!/usr/bin/bash

# Can we connect to the desired port?
if  ! nc -z localhost 82 ; then
	# if not, start the program
	cd /var/www/chess/
	nohup node chess-backend.js &
fi
