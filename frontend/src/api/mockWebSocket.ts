type MessageHandler = (message: WSMessage) => void;

interface WSMessage {
  type: 'connection' | 'message';
  status?: 'success' | 'error';
  id?: string;
  text?: string;
  userId?: string;
  timestamp?: string;
  chatId?: string;
}

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

  send(data: { chatId: string, text: string }): void {

    try {
      console.log('Отправлено:', data);

      const response: WSMessage = {
        type: 'message',
        id: Date.now().toString(),
        text: `Ответ на "${data.text}"`,
        userId: '2', // ID "собеседника"
        timestamp: new Date().toISOString(),
        chatId: data.chatId
      }

      setTimeout(() => this.notifyHandlers(response), 500 + Math.random() * 1000);
    } catch (error) {
      this.notifyHandlers({
        type: 'connection',
        status: 'error'
      });
    }
  }

  private notifyHandlers(message: any): void {
    this.messageHandlers.forEach(handler => handler(message));
  }
}

export const mockWebSocket = MockWebSocket.getInstance();