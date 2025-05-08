type MessageHandler = (message: any) => void;

class MockWebSocket {
  private static instance: MockWebSocket;
  private messageHandlers: MessageHandler[] = [];

  constructor() {
    // Имитация подключения
    setTimeout(() => {
      this.notifyHandlers({ type: 'connection', status: 'success' });
    }, 500);
  }

  static getInstance(): MockWebSocket {
    if (!MockWebSocket.instance) {
      MockWebSocket.instance = new MockWebSocket();
    }
    return MockWebSocket.instance;
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  send(data: any): void {
    console.log('Отправлено:', data);
    // Имитация ответа через 0.5-1.5 сек
    setTimeout(() => {
      this.notifyHandlers({
        type: 'message',
        id: Date.now(),
        text: `Ответ на "${data.text}"`,
        userId: '2', // ID "собеседника"
        timestamp: new Date()
      });
    }, 500 + Math.random() * 1000);
  }

  private notifyHandlers(message: any): void {
    this.messageHandlers.forEach(handler => handler(message));
  }
}

export const mockWebSocket = MockWebSocket.getInstance();