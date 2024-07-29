// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { AppService } from './app.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   //dựng ra được websocket để client kết nối vô
//   @WebSocketServer()
//   server: Server;

//   private connectedClients: Set<string> = new Set();

//   constructor(private readonly appService: AppService) {}

//   handleConnection(client: Socket) {
//     const { id } = client;
//     if (id) {
//       this.connectedClients.add(id);
//       const messages = this.appService.getMessages();
//       this.server.emit('connectedClients', Array.from(this.connectedClients));
//       this.server.emit('message', messages);
//     }
//   }

//   handleDisconnect(client: Socket) {
//     const { id } = client;
//     if (id) {
//       this.connectedClients.delete(id);
//       if (this.connectedClients.size === 0) {
//         // No clients connected, clear messages
//         this.appService.clearMessages();
//       }
//       this.server.emit('connectedClients', Array.from(this.connectedClients));
//     }
//   }

//   @SubscribeMessage('message')
//   handleMessage(client: Socket, payload: string): void {
//     const id = client.id;
//     const messages = this.appService.addMessage(id, payload);
//     this.server.emit('message', messages);
//   }
// }
