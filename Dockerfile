# ── Etapa 1: Build do Angular ────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app

COPY fatura.client/package*.json ./
RUN npm ci

COPY fatura.client/. .
RUN npm run build -- --configuration production

RUN find /app/dist -type f | head -30

# ── Etapa 2: Build do .NET ───────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY ["Fatura.Server/Fatura.Server.csproj", "Fatura.Server/"]
RUN dotnet restore "Fatura.Server/Fatura.Server.csproj" /p:BuildProjectReferences=false

COPY Fatura.Server/. Fatura.Server/
RUN dotnet publish "Fatura.Server/Fatura.Server.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false \
    /p:BuildProjectReferences=false

# ── Etapa 3: Imagem final ────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copia o backend publicado
COPY --from=backend-build /app/publish .

# Copia o build do Angular para onde o .NET serve os estáticos
# Ajuste o caminho após o "dist/" conforme o nome do seu app no angular.json
COPY --from=frontend-build /app/dist/fatura.client ./wwwroot

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "Fatura.Server.dll"]