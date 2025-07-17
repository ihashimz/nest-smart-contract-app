# Blockchain Options Transfer System

A NestJS-based system for transferring financial options between banks using blockchain technology.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

## 📋 Project Requirements

### Core Dependencies
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Ethereum/Polygon with ethers.js
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI

## 🏗️ Project Structure

```
src/
├── auth/                    # Authentication & Authorization
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   └── login.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── blockchain/              # Blockchain Integration
│   ├── blockchain.service.ts
│   └── blockchain.module.ts
├── options/                 # Options Management
│   ├── options.controller.ts
│   ├── options.service.ts
│   ├── options.module.ts
│   ├── entities/
│   │   ├── option.entity.ts
│   │   └── option-transfer.entity.ts
│   └── dto/
│       ├── create-option.dto.ts
│       ├── transfer-option.dto.ts
│       └── option-response.dto.ts
├── banks/                   # Bank Management
│   ├── banks.controller.ts
│   ├── banks.service.ts
│   ├── banks.module.ts
│   ├── entities/
│   │   └── bank.entity.ts
│   └── dto/
│       └── bank.dto.ts
├── audit/                   # Audit Logging
│   ├── audit.service.ts
│   ├── audit.module.ts
│   └── entities/
│       └── audit-log.entity.ts
├── common/                  # Shared Utilities
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   └── filters/
│       └── http-exception.filter.ts
├── config/                  # Configuration
│   ├── database.config.ts
│   └── app.config.ts
├── app.module.ts
└── main.ts
```

## 🔐 Authentication & Authorization

- JWT-based authentication for banks
- Role-based access control (BANK_ADMIN, TRADER, COMPLIANCE)
- Bank-specific user isolation

## 📊 Core Entities

### Option Entity
- Symbol, strike price, expiration date
- Option type (CALL/PUT)
- Premium and quantity
- Blockchain address and token ID
- Current owner (bank)
- Transfer history

### Bank Entity
- Bank name and code
- Blockchain address
- Active status and metadata

### User Entity
- Email and password (bcrypt hashed)
- Roles and bank association
- Last login tracking

## 🔗 Blockchain Integration

- Ethers.js integration for Ethereum/Polygon
- Smart contract interaction for option transfers
- Gas fee estimation and management
- Transaction monitoring and confirmations

## 🛠️ API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Bank user authentication | No |
| POST | `/api/auth/register` | Register new bank user | No |
| POST | `/api/auth/profile` | Get user profile | Yes |
| GET | `/api/options` | List options | Yes |
| POST | `/api/options` | Create new option | Yes |
| GET | `/api/options/:id` | Get option details | Yes |
| POST | `/api/options/:id/transfer` | Transfer option | Yes |
| GET | `/api/options/:id/history` | Get transfer history | Yes |
| GET | `/api/banks` | List all banks | Yes |
| POST | `/api/banks` | Create new bank | Yes |
| GET | `/api/banks/:id` | Get bank details | Yes |
| PATCH | `/api/banks/:id` | Update bank | Yes |
| DELETE | `/api/banks/:id` | Delete bank | Yes |

## ⚙️ Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/options_db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=deployed-contract-address
CHAIN_ID=137

# Application
PORT=3000
NODE_ENV=development

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

## 🔒 Security Features

- Helmet for security headers
- Rate limiting
- CORS configuration
- Input sanitization
- Comprehensive audit logging
- JWT token validation
- Role-based access control

## 📚 Additional Features

- Swagger UI at `/api/docs`
- Health check endpoint
- Request/response logging
- Database migrations
- Unit and integration tests
- Docker containerization ready

## 🚦 Development Workflow

1. **Phase 1**: ✅ Basic project setup, authentication, database
2. **Phase 2**: ✅ Blockchain integration and smart contracts
3. **Phase 3**: ✅ Option transfer logic and validation
4. **Phase 4**: ✅ Audit logging and compliance features
5. **Phase 5**: Testing and deployment

## 📖 Documentation

- API documentation available at `/api/docs`
- Smart contract ABIs in `/contracts` directory
- Database schema in migration files

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Build image
docker build -t options-transfer-system .

# Run container
docker run -p 3000:3000 options-transfer-system
```

## 📝 License

This project is licensed under the ISC License. 