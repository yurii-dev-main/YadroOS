import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ChatInterface } from '../components/ChatInterface';

export const ChatPage = () => (
  <Card className="h-full border-slate-800/60 bg-slate-950/40">
    <CardHeader>
      <CardTitle>AI Assistant</CardTitle>
    </CardHeader>
    <CardContent className="h-[600px]">
      <ChatInterface />
    </CardContent>
  </Card>
);
