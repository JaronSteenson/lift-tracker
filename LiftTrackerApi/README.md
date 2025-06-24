Runtime and sdk were installed by rider IDE
```shell
sudo snap install rider --classic
```

Sdk/cli
https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install?tabs=dotnet9&pivots=os-linux-ubuntu-2410
```shell
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0
```

Local dev env database
```shell
docker run -d -p 3306:3306 --name lt-mysql lift-tracker-api-mysql 

# Build/Run
cd Docker/mysql
docker build -t lift-tracker-api-mysql .
docker run -d --name lift-tracker-api-mysql -p 3306:3306 -v ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d lift-tracker-api-mysql

# Start
docker start lift-tracker-api-mysql

# Connect to the database (cli)
docker exec -it lift-tracker-api-mysql bash
mysql -u root -p

# Stop
docker stop lift-tracker-api-mysql

# Build/Run debug
docker build --no-cache -t lift-tracker-api-mysql .
docker run -p 3306:3306 --name lt-mysql lift-tracker-api-mysql 
```

EF
```shell
dotnet tool install --global dotnet-ef
dotnet add package Microsoft.EntityFrameworkCore.Design


# add to tools to path in .bash profile
export PATH="~/.dotnet/tools:$PATH";
export DOTNET_ROOT=~/.dotnet
```

run from cli 
```shell
dotnet run
```

run tests from cli
```shell
cd LiftTrackerApi.Tests
dotnet test
```

run migrations from cli
```shell
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update # development database
ASPNETCORE_ENVIRONMENT=Test dotnet ef database update # test database
```

run from rider
```shell
# Set the path to the dotnet sdk in rider
# File -> Settings -> Build, Execution, Deployment -> Toolset and Build
/home/jaron/.dotnet
```
