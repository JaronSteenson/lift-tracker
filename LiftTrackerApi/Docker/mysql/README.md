# MySQL Quick Start

## Install dependencies
```shell
apt get install -y docker
```

# Initial build/run
Note this will create the dev and test databases but not create any tables or populate them with data.
[That is managed via EF migrations](../../README.md).
```shell
docker build -t lift-tracker-api-mysql .
docker run -d --name lift-tracker-api-mysql -p 3306:3306 -v ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d lift-tracker-api-mysql
```

# Restart
```shell
docker restart lt-mysql
```

# Stop
```shell
docker stop lift-tracker-api-mysql
```

# Connect to the database (cli)
docker exec -it lift-tracker-api-mysql bash
mysql -u root -p


# Build/Run debug
docker build --no-cache -t lift-tracker-api-mysql .
docker run -p 3306:3306 --name lt-mysql lift-tracker-api-mysql 

## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
