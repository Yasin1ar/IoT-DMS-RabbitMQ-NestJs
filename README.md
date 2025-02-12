# IoT X-ray Data Management System

## Overview
This is a NestJS-based API that processes x-ray data from IoT devices using RabbitMQ and MongoDB.

## Features
- **RabbitMQ Integration** for processing real-time x-ray signals.
- **MongoDB Storage** with Mongoose.
- **RESTful API** with Swagger Documentation.
- **IoT Simulator** that generates and sends fake x-ray data.

## Setup Instructions
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Yasin1ar/IoT-DMS-RabbitMQ-NestJs
cd main-api
```
### 2️⃣ Install Dependencies
```sh
npm install
```
### 3️⃣ Start RabbitMQ and MongoDB (Docker)
```sh
docker-compose up -d
```
### 4️⃣ Run the API
```sh
npm run start
```
### 5️⃣ Run the Producer App (Separate Terminal)
```sh
cd producer-app
npm install
npm run start
```

### 6️⃣Access API Docs

Go to:
*http://localhost:3000/api/docs*

### 7️⃣ Testing
```sh
npm run test
```

### App Architecture
```
Main API (NestJS)      Producer App (NestJS)
    ⬇️                           ⬇️
 Process X-ray Data       Simulates IoT Devices
    ⬇️                           ⬇️
  Stores in MongoDB    Sends to RabbitMQ Queue
    ⬇️                           ⬇️
   Provides API         Runs as a Microservice
```