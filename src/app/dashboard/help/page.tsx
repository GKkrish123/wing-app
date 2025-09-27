import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, FileText, ExternalLink } from "lucide-react"

// Server component
export default function HelpPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with using Wing and find answers to common questions.
        </p>
      </div>

      {/* Quick Help */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Learn the basics of using Wing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Guide
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Community
            </CardTitle>
            <CardDescription>
              Join our community forum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Forum
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions and answers about using Wing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">How do I switch between helper and seeker modes?</h4>
            <p className="text-sm text-muted-foreground">
              You can switch between modes using the switch button in the header, or by visiting your profile page to set up additional profiles.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">How do I find helpers near me?</h4>
            <p className="text-sm text-muted-foreground">
              Go to the &quot;Find Helpers&quot; section and use the map view to see helpers in your area. You can also create a request for specific help.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">How do I become a helper?</h4>
            <p className="text-sm text-muted-foreground">
              Set up your helper profile by going to your profile page and clicking &quot;Set Up Helper Profile&quot;. Add your skills and areas of expertise.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Is my location data safe?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, we only share approximate location data with other users when you choose to enable location sharing in your settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}