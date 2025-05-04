interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
  encrypted?: boolean;
}