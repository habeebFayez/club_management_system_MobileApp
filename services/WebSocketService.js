// // services/WebSocketService.js
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
//
// let activeClient = null;
//
// export const connectWebSocket = (jwtToken, onMessageReceived) => {
//     if (activeClient?.connected) return;
//     // Cleanup any existing client
//     if (activeClient) {
//         activeClient.deactivate();
//     }
//
//     // Because the server uses .withSockJS(), we must use SockJS here:
//     const socket = new SockJS('http://192.168.1.110:8080/ws');
//
//     const stompClient = new Client({
//         webSocketFactory: () => socket,
//         connectHeaders: {
//             // Send token in the "Authorization" header
//             Authorization: `Bearer ${jwtToken}`,
//         },
//         onConnect: () => {
//             console.log('SockJS + STOMP connected!');
//
//             // Subscribe to user-specific notifications
//             stompClient.subscribe('/user/notification', (message) => {
//                 const notification = JSON.parse(message.body);
//                 console.log('Received WebSocket notification:', notification);
//                 onMessageReceived(notification);
//             });
//         },
//         onStompError: (frame) => {
//             console.error('STOMP error:', frame.headers['message']);
//         },
//         onWebSocketError: (event) => {
//             console.error('WebSocket general error:', event);
//         },
//     });
//
//     stompClient.activate();
//     activeClient = stompClient;
// };
//
// /**
//  * Disconnect from the WebSocket, e.g. when unmounting or logging out.
//  */
// export const disconnectWebSocket = () => {
//     if (activeClient) {
//         activeClient.deactivate();
//         activeClient = null;
//     }
// };
