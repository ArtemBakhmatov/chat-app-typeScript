import { Chat, User, Message} from '../types/chat';

// Тестовые пользователи
const mockUsers: User[] = [
  { id: '1', name: 'Артем', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Мария', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Иван', avatar: 'https://i.pravatar.cc/150?img=3' }
];

// Тестовые сообщения 
const mockMessages: Message[] = [
  { id: '101', text: 'Привет! Как дела?', userId: '1', timestamp: new Date(2024, 5, 10, 14, 30) },
  { id: '102', text: 'Всё отлично!', userId: '2', timestamp: new Date(2024, 5, 10, 14, 35) },
  { id: '103', text: 'Давно не виделись', userId: '1', timestamp: new Date(2024, 5, 10, 14, 40) }
];

// Тестовые чаты
export const mockChats: Chat[] = [
  {
    id: '1',
    title: 'Общий чат',
    users: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages[1]
  },
  {
    id: '2',
    title: 'Работа',
    users: [mockUsers[0], mockUsers[2]],
    lastMessage: mockMessages[2]
  }
];

export { mockUsers, mockMessages };

