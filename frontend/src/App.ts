import { mockChats, mockMessages, mockUsers } from './mocks/data';

import './styles/main.scss';

class ChatApp {
  private currentChatId: string | null = null;

  constructor() {
    console.log('ChatApp initialized!');
    this.renderChatList();
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
}

new ChatApp();