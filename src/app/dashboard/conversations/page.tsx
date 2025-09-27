import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"
import { ConversationsClient } from "@/components/dashboard"
import { ContentLoader } from "@/components/loading"

// Server component
export default function ConversationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">My Conversations</h1>
        <p className="text-muted-foreground">
          View and manage all your active conversations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Active Conversations
          </CardTitle>
          <CardDescription>
            Your ongoing chats with helpers and seekers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ContentLoader />}>
            <ConversationsClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}