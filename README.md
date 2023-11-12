## Initial setup
```
# Clone the repo
git clone --recursive git@bitbucket-personal:jaronsteenson/lift-tracker;
cd lift-tracker;
cp .env.example .env;
cd lift-tracker-laradock;
cp -f .env.example .env;

# Set up docker
docker-compose up nginx mysql;

# Set up js
nvm use 14;
npm ci;

# Set up php
docker-compose exec workspace bash;
compoers install;
artisan migrate; 
artisan migrate --database=mysql_test; # Migrate the app and unit test db;
```


## Starting laradoc
```
cd ~/code/lift-tracker/lift-tracker-laradock && docker-compose up -d nginx mysql && cd ..;
```

## Migrating the database
```
docker-compose exec workspace bash; # get into the workspace container

artisan migrate;
artisan migrate --database=mysql_test; # Migrate the app and unit test db;
```

## Running php unit from cli
```
docker-compose exec workspace bash; # get into the workspace container

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter "/(::testDeleteRemovesExercises)( .*)?$/"

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter RoutineExerciseTest

php ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml
```
