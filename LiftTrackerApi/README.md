# Dotnet API Quck Start

```shell
sudo snap install rider --classic
```

## Install dependencies
https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu-install?tabs=dotnet9&pivots=os-linux-ubuntu-2410

```shell
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0
dotnet tool install --global dotnet-ef
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet tool restore
```

### Add tools to path in .bash profile
```shell
export PATH="~/.dotnet/tools:$PATH";
export DOTNET_ROOT=~/.dotnet
```

## Run the dev server
```shell
dotnet run
```

### Curl sanity check
```shell
curl https://localhost:7023/workout-programs -k
```

## Run tests
```shell
dotnet test
```

## Run database migrations
```shell
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update # development database
ASPNETCORE_ENVIRONMENT=Test dotnet ef database update # test database
```

## Create a new database migration 
This project is using EF Core code-first migrations.
```shell
dotnet ef migrations add NameOfMigration
```

## Run/debug from rider
1. Set the path to the dotnet sdk in rider
2. File → Settings → Build, Execution, Deployment → Toolset and Build

```shell
/home/jaron/.dotnet
```

## Code formatting
Using csharpier.
```shell
# Install csharpier cli tool
dotnet tool restore

# Format the code
dotnet csharpier format . && dotnet csharpier format ../LiftTrackerApi.Tests

# Check formatting
dotnet csharpier check . && dotnet csharpier check ../LiftTrackerApi.Tests
```

### Install csharpier rider plugin
1. `ctrl + alt + s` → Plugins → Marketplace → Search for CSharpier → Install
2. Tools → CSharpier → Run on save

## License
This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
