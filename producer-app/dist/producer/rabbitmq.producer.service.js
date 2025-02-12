"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitMQProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQProducerService = void 0;
const common_1 = require("@nestjs/common");
const amqp = require("amqplib");
let RabbitMQProducerService = RabbitMQProducerService_1 = class RabbitMQProducerService {
    constructor() {
        this.logger = new common_1.Logger(RabbitMQProducerService_1.name);
    }
    async onModuleInit() {
        await this.connect();
    }
    async connect() {
        this.connection = await amqp.connect('amqp://localhost:5672');
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue('x-ray-queue', { durable: true });
        this.logger.log('Connected to RabbitMQ and queue asserted.');
    }
    async sendXrayData(deviceId, data) {
        const message = JSON.stringify({ [deviceId]: { data } });
        this.channel.sendToQueue('x-ray-queue', Buffer.from(message));
        this.logger.log(`Sent x-ray data for device: ${deviceId}`);
    }
};
exports.RabbitMQProducerService = RabbitMQProducerService;
exports.RabbitMQProducerService = RabbitMQProducerService = RabbitMQProducerService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitMQProducerService);
//# sourceMappingURL=rabbitmq.producer.service.js.map