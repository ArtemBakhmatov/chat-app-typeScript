export class LoadingDots {
  static create(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'loading-dots';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      container.appendChild(dot);
    }

    return container;
  }
}