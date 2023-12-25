## Initial setup
```shell
# Clone the repo
git clone --recursive git@bitbucket-personal:jaronsteenson/lift-tracker;
cd lift-tracker;
cp .env.example .env;
cd lift-tracker-laradock;
git fetch origin lift-tracker && git checkout lift-tracker;
cp -f .env.example .env;

# Set up docker
docker-compose up nginx mysql;

# Set up js
nvm use 14.19.1;
npm ci;

# Set up php
docker-compose exec workspace bash;
composer install;
artisan migrate; 
artisan migrate --database=mysql_test; # Migrate the app and unit test db;
```


## Starting laradoc
```shell
cd ~/code/lift-tracker/lift-tracker-laradock && docker-compose up -d nginx mysql && cd ..;
```

## Migrating the database
```shell
docker-compose exec workspace bash; # get into the workspace container

artisan migrate;
artisan migrate --database=mysql_test; # Migrate the app and unit test db;
```

## Running php unit from cli
```shell
docker-compose exec workspace bash; # get into the workspace container

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter "/(::testDeleteRemovesExercises)( .*)?$/"

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter RoutineExerciseTest

php ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml
```

## Using phpstorm example config
```shell
cp .idea.example/** .idea  -rf
```

## Creating new phpstorm config example
```shell
cp .idea/** .idea.example -rf;
```
