import { FixedSizeList as List } from 'react-window';
import { Message } from '../types/chat';

export class VirtualScroll {
  private static instance: VirtualScroll;
  private listRef: List | null = null;

  private constructor() {}

  static getInstance(): VirtualScroll {
    if (!VirtualScroll.instance) {
      VirtualScroll.instance = new VirtualScroll();
    }
    return VirtualScroll.instance;
  }

  init(container: HTMLElement, messages: Message[]) {
    // Удаляем старый скролл если был
    if (this.listRef) {
      container.innerHTML = '';
    }

    // Создаем контейнер для виртуального скролла
    const listContainer = document.createElement('div');
    listContainer.style.height = '100%';
    container.appendChild(listContainer);

    // Инициализируем виртуальный скролл
    this.listRef = new List({
      height: container.offsetHeight,
      itemCount: messages.length,
      itemSize: 80, // Примерная высота одного сообщения
      width: '100%',
      // @ts-expect-error
      children: ({ index, style }) => {
        const msg = messages[index];
        const messageElement = document.createElement('div');
        messageElement.style.cssText = Object.entries(style)
          .map(([key, val]) => `${key}:${val}`)
          .join(';');
        
        messageElement.innerHTML = `
          <div class="message ${msg.userId === '1' ? 'outgoing' : 'incoming'}">
            <div class="message-content">${msg.text}</div>
            <div class="message-time">
              ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `;
        
        return messageElement;
      }
    });
    // @ts-expect-error
    this.listRef.render(listContainer);
  }

  scrollToBottom() {
    this.listRef?.scrollToItem(this.listRef.props.itemCount - 1);
  }
}