import { mockChats, mockMessages, mockUsers } from './mocks/data';

import './styles/main.scss';
import { Message } from './types/chat';

class ChatApp {
  private currentChatId: string | null = null;

  constructor() {
    console.log('ChatApp initialized!');
    this.renderChatList();
    this.setupEventListeners();
    // Вызываем при фокусе на input
    document.getElementById('messageInput')?.addEventListener('focus', () => {
      this.simulateTyping();
    });
  }

  private renderChatList(): void {
    const chatList = document.getElementById('chatList') as HTMLElement;

    if (mockChats.length === 0) {
      chatList.innerHTML = '<div class="empty">Чатов пока нет</div>';
      return;
    }
    
    chatList.innerHTML = mockChats.map(chat => `
      <div class="chat-item" data-chat-id="${ chat.id }">
        <img 
          src="${ chat.users[1].avatar || 'https://i.pravatar.cc/150?img=0' }" 
          alt="${ chat.users[1].name }"
        >
        <div class="chat-info">
          <h3>${ chat.title }</h3>
          <p>${ chat.lastMessage?.text || 'Нет сообщений'}</p>
        </div>
      </div>
    `).join(''); // объединяет массив и становится строкой

    // Добавляем обработчик выбора чата
    document.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.getAttribute('data-chat-id');
        this.selectChat(chatId!);
      });
    });
  }

  private selectChat(chatId: string): void {
    this.currentChatId = chatId;

    const chat = mockChats.find(c => c.id === chatId);
    if (!chat ) return;

    // Обновляем заголовок чата
    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.innerHTML = `<h2>${ chat.title }</h2>`;

    // TODO: Рендер сообщений (следующий этап)
    console.log('Выберите чат:', chatId);
    this.renderMessages(chatId);

    // Снимаем выделение со всех чатов
    document.querySelectorAll('.chat-item').forEach(item => {
      item.setAttribute('data-active', 'false');
    });

    // Выделяем выбранный чат
    const selectChat = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (selectChat) {
      selectChat.setAttribute('data-active', 'true');
    }
  }

  private renderMessages(chatId: string): void {
    const messagesContainer = document.getElementById('messages') as HTMLElement;
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat ) return;

    // Фильтруем сообщения (в реальном приложении будет запрос к API)
    const chatMessages = mockMessages.filter(msg => 
      chat.users.some(user => user.id === msg.userId)
    );

    messagesContainer.innerHTML = chatMessages.map(msg => `
      <div class="message ${ msg.userId === '1' ? 'outgoing' : 'incoming' }">
        <div class="message-content">${ msg.text }</div>
        <div class="message-time">
          ${ msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        </div>
      </div>
    `).join('');
  }

  private setupEventListeners(): void {
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;

    sendButton.addEventListener('click', () => {
      if (!this.currentChatId || !messageInput.value.trim()) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageInput.value,
        userId: '1', // ID текущего пользователя (пока mock)
        timestamp: new Date()
      };

      this.addMessageToChat(newMessage);
      messageInput.value = '';
    });
  }

  private addMessageToChat(message: Message): void {
    const messagesContainer = document.getElementById('messages') as HTMLElement;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${ message.userId === '1' ? 'outgoing' : 'incoming' }`;
    messageElement.innerHTML = `
      <div class="message-content">${ message.text }</div>
      <div class="message-time">
        ${ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    //messagesContainer.scrollTop = messagesContainer.scrollHeight; // авто-я прокрутка элемента до нижней части.

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  private simulateTyping(): void {
    const indicator = document.getElementById('typingIndicator');
    if (!indicator) return;

    indicator.setAttribute('data-active', 'true');

    setTimeout(() => {
      indicator.setAttribute('data-active', 'false');
    }, 2000);
  }
  
}

new ChatApp();