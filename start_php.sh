# ! /bin/bash


cd backend
composer i 
composer dump-autoload 
php -S 127.0.0.1:8000 router.php 

