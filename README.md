# IoT Data Management System (DMS)

A real-time IoT data management system built with NestJS, RabbitMQ, and MongoDB for processing and storing X-ray signals from IoT devices.

## 🚀 Features

- **Real-time Data Processing**: RabbitMQ-based message queuing for IoT device data
- **X-ray Signal Management**: Store and retrieve X-ray signal data with device tracking
- **RESTful API**: Swagger-documented API endpoints for data operations
- **IoT Simulator**: Built-in simulator for testing with mock device data
- **Docker Support**: Complete containerized setup with Docker Compose
- **MongoDB Integration**: Persistent storage with optimized indexing
- **Dashboard**: Simple, elegant UI.

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yasin1ar/IoT-DMS-RabbitMQ-NestJs.git
   cd IoT-DMS-RabbitMQ-NestJs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory.
   Should be something like `.env.example`.
   Or If you are lazy, just remove the `.example` postfix and it will work.

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d
```

### Manual Setup

1. **Start RabbitMQ and MongoDB**
   ```bash
   docker-compose up rabbitmq mongodb -d
   ```

2. **Run the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 📡 API Documentation

Once the application is running, access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## UI

Once the application is running, access the Dashboard at:
```
http://localhost:3000/
```

## 🐳 Docker

### Services

- **API**: NestJS application (Port 3000)
- **RabbitMQ**: Message broker (Port 5672, Management UI: 15672)
- **MongoDB**: Database (Port 27017)


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please open an issue in the repository. 