import { OnModuleInit } from '@nestjs/common';
export declare class RabbitMQProducerService implements OnModuleInit {
    private connection;
    private channel;
    private readonly logger;
    onModuleInit(): Promise<void>;
    private connect;
    sendXrayData(deviceId: string, data: any[]): Promise<void>;
}
