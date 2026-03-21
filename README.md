# Computer Store

Website ban may tinh va linh kien dung stack:

- Backend: ASP.NET Core Web API .NET 8, EF Core, JWT
- Frontend: React + TypeScript + Vite
- Database: SQL Server
- Deployment: Docker Compose

## Kien truc

Backend theo 3 layer:

- `ComputerStore.Api`: controller, auth, swagger, middleware
- `ComputerStore.Bll`: DTO, service, business rule
- `ComputerStore.Dal`: entity, repository, EF Core, seed data

Frontend gom chung client site va admin site:

- Client: home, product list, product detail, cart, checkout, orders, profile
- Admin: dashboard, categories, products, customers, orders

## Tai khoan seed

- Admin: `admin@computerstore.local` / `Admin@123`
- Customer: `customer@computerstore.local` / `Customer@123`

## Chay local

### Backend

```bash
cd backend
dotnet build ComputerStore.sln
dotnet run --project src/ComputerStore.Api
```

API mac dinh: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Web dev mac dinh: `http://localhost:5173`

## Chay bang Docker

```bash
docker compose up --build
```

Sau khi chay:

- Frontend: `http://localhost:3001`
- API + Swagger: `http://localhost:8088/swagger`
- SQL Server: `localhost:1433`

## Database

He thong dung 7 bang:

- `Roles`
- `Users`
- `Categories`
- `Products`
- `Orders`
- `OrderDetails`
- `Carts`
