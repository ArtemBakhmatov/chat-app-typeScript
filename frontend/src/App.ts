import { mockWebSocket } from './api/mockWebSocket';
import { LoadingDots } from './components/LoadingDots';
import { mockChats, mockMessages, mockUsers } from './mocks/data';

import './styles/main.scss';
import { Message } from './types/chat';

interface ChatHistory {
  [chatId: string]: Message[];
}

class ChatApp {
  private currentChatId: string | null = null;
  private typingTimeout: number | null = null;
  private chatHistory: ChatHistory = {};
  private currentMessagesPage = 1;
  private readonly MESSAGES_PER_PAGE = 20;

  constructor() {
    console.log('ChatApp initialized!');
    this.renderChatList();
    this.setupEventListeners();
    this.initWebSocket();
    this.loadHistory();
    this.setupSearch();
  }

  // === Chat List Management ===
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
        <div class="chat-actions">
          <button id="clearHistoryBtn">Очистить историю</button>
        </div>
      </div>
      <div class="typing-indicator" id="typingIndicator">Печатает...</div>
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Поиск в сообщениях...">
      </div>
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

    this.currentMessagesPage = 1; // Сброс при смене чата
  }
  // === ####################### === 
  
  // === Messages Management === 
  private renderMessages(chatId: string): void {
    const messagesContainer = document.getElementById('messages') as HTMLElement;
    if (!messagesContainer) {
      console.error('Messages container not found!');
      return;
    }
    const allMessages = this.chatHistory[chatId] || [];
    const startIdx = Math.max(0, allMessages.length - this.currentMessagesPage * this.MESSAGES_PER_PAGE);
    const messagesToShow = allMessages.slice(startIdx);

    // Очищаем только при первой загрузке
    if (this.currentMessagesPage === 1) {
      messagesContainer.innerHTML = '';
    }

    const grouped = this.groupMessagesByDate(messagesToShow);

    messagesContainer.innerHTML = Object.entries(grouped)
      .map(([date, msgs]) => `
        <div class="message-group">
          <div class="message-date">${date}</div>
          ${msgs.map(msg => this.renderSingleMessage(msg)).join('')}
        </div>
      `).join('') + messagesContainer.innerHTML; // Добавляем в начало

    // Прячем кнопку, если все сообщения загружены
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 
        allMessages.length > messagesToShow.length ? 'block' : 'none';
    }
  }

  // Метод для загрузки сообщений порциями
  private loadMoreMessages(): void {
    if (!this.currentChatId) return;
    
    this.currentMessagesPage++;
    this.renderMessages(this.currentChatId);
  }
  // === ####################### === 

  private groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
    return messages.reduce((groups, msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    }, {} as Record<string, Message[]>);
  }

  private renderSingleMessage(msg: Message): string {
    return `
      <div class="message ${msg.userId === '1' ? 'outgoing' : 'incoming'}">
        <div class="message-content">${msg.text}</div>
        <div class="message-time">
          ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
    const messageInput = document.getElementById('messageInput') as HTMLInputElement;

    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
      this.loadMoreMessages();
    });

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
    });

    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && messageInput.value.trim()) {
        this.sendMessage(messageInput.value.trim());
        messageInput.value = '';
      }
    });

    document.getElementById('chatHeader')?.addEventListener('click', (e) => {
      console.log('Нажатие на кнопку clearHistoryBtn');
      if ((e.target as HTMLElement).id === 'clearHistoryBtn') {
        if (this.currentChatId && confirm('Удалить всю историю чата?')) {
          delete this.chatHistory[this.currentChatId];
          this.saveHistory();
          this.renderMessages(this.currentChatId);
          console.log('История очищена для чата', this.currentChatId);
        }
      }
      
    });
  }

  private addMessageToChat(message: Omit<Message, 'timestamp'> & { timestamp: Date }): void {
    const messageForHistory = {
      ...message,
      timestamp: message.timestamp.toISOString() // Конвертируем в строку
    };

    if (!this.currentChatId) return;
    
    if (!this.chatHistory[this.currentChatId]) {
      this.chatHistory[this.currentChatId] = [];
    }

    this.chatHistory[this.currentChatId] = [
      ...(this.chatHistory[this.currentChatId] || []),
      messageForHistory
    ];

    this.saveHistory();

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

    // Проверка на дубликаты сообщений
    const isDuplicate = this.chatHistory[this.currentChatId]
    .some(m => m.id === messageForHistory.id);
  
    if (!isDuplicate) {
      this.chatHistory[this.currentChatId].push(messageForHistory);
    }
  }

  private showTypingIndicator(show: boolean): void {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.setAttribute('data-active', String(show));
    }
  }

  // === WebSocket Handlers ===
  private initWebSocket(): void {
    mockWebSocket.onMessage((message) => {
      if (message.type === 'connection') {
        this.updateConnectionStatus(message.status === 'success');
      }

      if (message.type === 'message' && message.id && message.text && message.userId && message.timestamp) {
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
  // === ####################### === 

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

   private loadHistory(): void {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      this.chatHistory = JSON.parse(saved);
    }
  }

  private saveHistory(): void {
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
  }
  
  // Реализация логики поиска по истории
  private setupSearch(): void {
    document.getElementById('chatHeader')?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'searchInput') {
        setTimeout(() => {
          this.filterMessages(target.value.trim());
        }, 500);
      }
    });
  }

   private filterMessages(query: string): void {
    if (!this.currentChatId) return;

    const allMessages = this.chatHistory[this.currentChatId] || [];
    const filtered = query 
      ? allMessages.filter(msg => msg.text.toLowerCase().includes(query.toLowerCase()))
      : allMessages;

    this.renderFilteredMessages(filtered);
  }

  private renderFilteredMessages(messages: Message[]): void {
    const container = document.getElementById('messages');
    if (!container) return;

    container.innerHTML = messages
      .map(msg => this.renderSingleMessage(msg))
      .join('');
  }
}

// ===== Utils =====
function formatMessageDate(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function debounce(func: Function, timeout = 300) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    // @ts-expect-error.
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
}
// === ####################### === 

new ChatApp();