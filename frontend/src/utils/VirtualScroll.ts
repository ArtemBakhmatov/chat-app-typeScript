type VirtualScrollOptions = {
  container: HTMLElement;
  itemHeight: number;
  renderItem: (index: number) => HTMLElement;
  totalItems: number;
  buffer?: number;
};

export class VirtualScroll {
  private options: VirtualScrollOptions;
  private visibleItems: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;
  private scrollTop: number = 0;
  private items: HTMLElement[] = [];
  private contentEl: HTMLElement;

  constructor(options: VirtualScrollOptions) {
    this.options = options;

    // Создаем основной контейнер
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'virtual-scroll-content';
    this.contentEl.style.position = 'relative';
    this.contentEl.style.height = `${this.options.totalItems * this.options.itemHeight}px`;
    
    // Очищаем и добавляем в DOM
    this.options.container.innerHTML = '';
    this.options.container.appendChild(this.contentEl);


    this.calculateVisible();
    this.render();
    this.setupEvents();
    console.log('VirtualScroll initialized with options:', this.options);

  }

  private setupEvents() {
    this.options.container.addEventListener('scroll', () => {
      this.scrollTop = this.options.container.scrollTop;
      this.calculateVisible();
      this.render();
    });
  }

  private calculateVisible() {
    this.visibleItems = Math.ceil(this.options.container.offsetHeight / this.options.itemHeight);
    this.startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / this.options.itemHeight) - this.options.buffer!
    );
    this.endIndex = Math.min(
      this.options.totalItems - 1,
      this.startIndex + this.visibleItems + this.options.buffer! * 2
    );
  }

  private render() {
    // Удаляем невидимые элементы
    this.items.forEach((item, index) => {
      if (item && (index < this.startIndex || index > this.endIndex)) {
        item.remove();
        this.items[index] = null!;
      }
    });

    // Добавляем новые элементы
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      if (!this.items[i]) {
        const item = this.options.renderItem(i);
        if (item) {
          item.style.position = 'absolute';
          item.style.top = `${i * this.options.itemHeight}px`;
          item.style.width = '100%';
          this.contentEl.appendChild(item);
          this.items[i] = item;
        }
      }
    }
  }

  public update(totalItems: number) {
    this.options.totalItems = totalItems;
    this.contentEl.style.height = `${totalItems * this.options.itemHeight}px`;
    this.calculateVisible();
    this.render();
  }

  public scrollToBottom() {
    this.options.container.scrollTop = this.contentEl.offsetHeight;
  }
}