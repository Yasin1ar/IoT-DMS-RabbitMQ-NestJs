import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Xray } from '../signals/schemas/x-ray.schema';

@WebSocketGateway({
  cors: { origin: true },
})
export class SignalsGateway {
  @WebSocketServer()
  server: Server;

  broadcastSignalCreated(xray: Xray): void {
    this.server.emit('signal.created', xray);
  }
}
