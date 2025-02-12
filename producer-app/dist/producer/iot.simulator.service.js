"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotSimulatorService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_producer_service_1 = require("./rabbitmq.producer.service");
let IotSimulatorService = class IotSimulatorService {
    constructor(rabbitMQProducer) {
        this.rabbitMQProducer = rabbitMQProducer;
    }
    onModuleInit() {
        this.startSimulation();
    }
    startSimulation() {
        setInterval(() => {
            const deviceId = `device-${Math.floor(Math.random() * 1000)}`;
            const data = this.generateXrayData();
            this.rabbitMQProducer.sendXrayData(deviceId, data);
        }, 5000);
    }
    generateXrayData() {
        return Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, index) => [
            index + 1,
            [Math.random() * 100, Math.random() * 100, Math.random() * 100],
        ]);
    }
};
exports.IotSimulatorService = IotSimulatorService;
exports.IotSimulatorService = IotSimulatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_producer_service_1.RabbitMQProducerService])
], IotSimulatorService);
//# sourceMappingURL=iot.simulator.service.js.map