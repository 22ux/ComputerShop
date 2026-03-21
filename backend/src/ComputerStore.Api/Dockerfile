FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ComputerStore.sln ./
COPY src/ComputerStore.Api/ComputerStore.Api.csproj src/ComputerStore.Api/
COPY src/ComputerStore.Bll/ComputerStore.Bll.csproj src/ComputerStore.Bll/
COPY src/ComputerStore.Dal/ComputerStore.Dal.csproj src/ComputerStore.Dal/

RUN dotnet restore ComputerStore.sln

COPY . .
RUN dotnet publish src/ComputerStore.Api/ComputerStore.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ComputerStore.Api.dll"]
