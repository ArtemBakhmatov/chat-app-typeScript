import './styles/main.scss';

class ChatApp {
  constructor() {
    console.log('ChatApp initialized!');
    this.renderChatList();
  }

  private renderChatList(): void {
    const chatList = document.getElementById('chatList') as HTMLElement;
    chatList.innerHTML = '<div class="empty">Чатов пока нет</div>'
  }
}

new ChatApp();