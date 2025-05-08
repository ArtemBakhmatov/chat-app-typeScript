import { mockWebSocket } from './api/mockWebSocket';
import { LoadingDots } from './components/LoadingDots';
import { mockChats, mockMessages, mockUsers } from './mocks/data';

import './styles/main.scss';
import { Message } from './types/chat';

class ChatApp {
  private currentChatId: string | null = null;
  private typingTimeout: number | null = null;

  constructor() {
    console.log('ChatApp initialized!');
    this.renderChatList();
    this.setupEventListeners();
    this.initWebSocket();
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
    chatHeader.innerHTML = `
      <div class="chat-status">
        <h2 id="currentChatTitle">${ chat.title }</h2>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span id="statusText">Offline</span>
          </div>
        </div>
      <div class="typing-indicator" id="typingIndicator">Печатает...</div>
    `;

    // TODO: Рендер сообщений (следующий этап)
    console.log('Выберите чат:', chatId);
    //this.renderMessages(chatId);

    // Снимаем выделение со всех чатов
    document.querySelectorAll('.chat-item').forEach(item => {
      item.setAttribute('data-active', 'false');
    });

    // Выделяем выбранный чат
    const selectChat = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
    if (selectChat) {
      selectChat.setAttribute('data-active', 'true');
    }

    // анимация загрузки чата 
    const messagesContainer = document.getElementById('messages') as HTMLElement;
    messagesContainer.after(LoadingDots.create());
    const loadingIndicator = document.querySelector('.loading-dots');

    if (loadingIndicator) {
      loadingIndicator.setAttribute('data-active', 'true');
      messagesContainer.setAttribute('data-loading', 'true');
      // messagesContainer.style.filter =  'blur(3px) brightness(90%)';
    }
  
    // Имитация загрузки
    setTimeout(() => {
      if (loadingIndicator) {
        loadingIndicator.setAttribute('data-active', 'false');
        messagesContainer.setAttribute('data-loading', 'false');
        // messagesContainer.style.filter =  '';
      }
      this.renderMessages(chatId);
    }, 800);

    this.showTypingIndicator(false); // Сброс индикатора при смене чата
    // Авто фокус на поле ввода при выборе чата:
    (document.getElementById('messageInput') as HTMLInputElement).focus();
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

    messageInput.addEventListener('input', () => {
      if (!this.currentChatId) return;
      
      this.showTypingIndicator(true);
      
      // Сбрасываем предыдущий таймер
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      
      this.typingTimeout = window.setTimeout(() => {
        this.showTypingIndicator(false);
      }, 2000);
    });

    sendButton.addEventListener('click', () => {
      if (!this.currentChatId || !messageInput.value.trim()) return;

      if (messageInput.value.trim()) {
        this.sendMessage(messageInput.value.trim());
        messageInput.value = '';
      }

      // const newMessage: Message = {
      //   id: Date.now().toString(),
      //   text: messageInput.value,
      //   userId: '1', // ID текущего пользователя (пока mock)
      //   timestamp: new Date()
      // };

      // this.addMessageToChat(newMessage);
      // messageInput.value = '';
    });

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && messageInput.value.trim()) {
        this.sendMessage(messageInput.value.trim());
        messageInput.value = '';
      }
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

  private showTypingIndicator(show: boolean): void {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.setAttribute('data-active', String(show));
    }
  }

  private initWebSocket(): void {
    mockWebSocket.onMessage((message) => {
      if (message.type === 'connection') {
        this.updateConnectionStatus(message.status === 'success');
      }

      if (message.type === 'message') {
        this.addMessageToChat({
          id: message.id,
          text: message.text,
          userId: message.userId,
          timestamp: new Date(message.timestamp)
        });
      }
    });
  }

  private sendMessage(text: string): void {
    if (!this.currentChatId) return;

    mockWebSocket.send({
      chatId: this.currentChatId,
      text: text
    })
  }

  private updateConnectionStatus(isOnline: boolean): void {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    // Добавляем проверки на существование элементов
    if (statusDot) {
      if (isOnline) {
          statusDot.setAttribute('data-status', 'online');
      } else {
          statusDot.removeAttribute('data-status');
      }
  }
  
  if (statusText) {
      statusText.textContent = isOnline ? 'Online' : 'Offline';
  }
  }
}

new ChatApp();