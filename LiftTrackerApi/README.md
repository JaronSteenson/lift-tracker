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
docker restart lt-mysql

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
dotnet test
```

run migrations from cli

```shell
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update # development database
ASPNETCORE_ENVIRONMENT=Test dotnet ef database update # test database
```

create migrations from cli

```shell
# We are using code first migrations, so alter the entity  classes first then run this command
dotnet ef migrations add NameOfMigration

# Run migrations
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update && ASPNETCORE_ENVIRONMENT=Test dotnet ef database update;
```

run from rider

```shell
# Set the path to the dotnet sdk in rider
# File -> Settings -> Build, Execution, Deployment -> Toolset and Build
/home/jaron/.dotnet
```

curl sanity check

```shell
curl https://localhost:7023/workout-programs -k
```

code formatting

```shell
# Install csharpier cli tool
dotnet tool restore

# Install csharpier rider plugin
`ctrl + alt + s` -> Plugins -> Marketplace -> Search for CSharpier -> Install
Tools -> CSharpier -> Run on save

# Format the code
dotnet csharpier format . && dotnet csharpier format ../LiftTrackerApi.Tests

# Check formatting
dotnet csharpier check . && dotnet csharpier check ../LiftTrackerApi.Tests
```
