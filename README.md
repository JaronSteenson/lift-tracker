
## Starting laradoc

```
cd ~/code/lift-tracker/lift-tracker-laradock && docker-compose up -d nginx mysql && cd ..;
```

## Migrating the test database
```
docker-compose exec workspace bash; # get into the workspace container

artisan migrate && artisan migrate --database=mysql_test; # migrate the test db
```

## Debugging a unit test

```
docker-compose exec workspace bash; # get into the workspace container

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter "/(::testDeleteRemovesExercises)( .*)?$/"

php -dxdebug.remote_enable=1 -dxdebug.remote_mode=req -dxdebug.remote_port=9000 -dxdebug.remote_host=172.17.0.1 ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml --filter RoutineExerciseTest

php ./vendor/phpunit/phpunit/phpunit --configuration ./phpunit.xml
```

<hr>

## Inital setup gotchas

### Local host might not connect

Go to http://127.0.0.1/ instead.

### 1. Create the databases and users

```
CREATE DATABASE lift_tracker;
CREATE DATABASE lift_tracker_test;

CREATE USER 'lift_tracker' IDENTIFIED WITH mysql_native_password BY '';
GRANT ALL PRIVILEGES ON *.* TO 'lift_tracker'@'localhost' WITH GRANT OPTION;

CREATE USER 'lift_tracker_test' IDENTIFIED WITH mysql_native_password BY '';
GRANT ALL PRIVILEGES ON *.* TO 'lift_tracker_test'@'localhost' WITH GRANT OPTION;
```

### 2. Run composer and npm install

### 3. Manually install memcached

`pecl install memcached`

### 4. Run the migrations

```
docker-compose exec workspace bash; # get into the workspace container

artisan migrate && artisan migrate --database=mysql_test; # migrate the test db
```

### 5. Run npm build
