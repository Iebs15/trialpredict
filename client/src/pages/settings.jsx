import { Save, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserData, updateUserData } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

export default function Settings() {
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", email_info: "", company: "", designation: "", about: "", uuid: "" })
  const navigate = useNavigate()
  const toast = useToast()
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const firstName = await getUserData("first_name_salescout_user")
      const uuid = await getUserData("user_salescout_id")
      const lastName = await getUserData("last_name_salescout_user")
      const email = await getUserData("user_salescout_email_id")
      const email_info = await getUserData("user_email_info")
      const company = await getUserData("company_salescout_user")
      const designation = await getUserData("user_designation")
      const about = await getUserData("user_about")
      setUser({
        firstName: firstName?.value || "",
        uuid: uuid?.value || "",
        lastName: lastName?.value || "",
        email: email?.value || "",
        company: company?.value || "",
        email_info: email_info?.value || "",
        designation: designation?.value || "",
        about: about?.value || ""
      })
    }

    fetchUser()
  }, [])

  const handleSaveAccountInfo = async () => {
    setIsSavingAccount(true);
    const updatedUser = {
      uuid: user.uuid,
      first_name: document.getElementById("firstname").value,
      last_name: document.getElementById("lastname").value,
      email: document.getElementById("email").value,
      company: document.getElementById("company").value,
      designation: document.getElementById("role").value,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}:6001/update_user_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const resData = await response.json();

      if (response.ok) {
        await updateUserData("first_name_salescout_user", updatedUser.first_name);
        await updateUserData("last_name_salescout_user", updatedUser.last_name);
        await updateUserData("user_salescout_email_id", updatedUser.email);
        await updateUserData("company_salescout_user", updatedUser.company);
        await updateUserData("user_designation", updatedUser.designation);
        toast({
          title: "Success",
          description: "Account information updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: resData.message || "There was an issue updating your info.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update:", error);
      toast({
        title: "Network error",
        description: "Something went wrong while updating your info.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveEmailInfo = async () => {
    setIsSavingEmail(true);
    const email_info = document.getElementById("email-info").value;
    const about = document.getElementById("about-info").value;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}:6001/update_email_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: user.uuid,
          email_info,
          about
        }),
      });

      if (response.ok) {
        await updateUserData("user_email_info", email_info);
        await updateUserData("user_about", about);
        toast({
          title: "Success",
          description: "Email info updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: "Could not update email info.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating email info:", error);
      toast({
        title: "Network error",
        description: "Something went wrong while updating email info.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };



  return (
    <div className="relative flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Translucent overlay with lock icon */}
      {/* <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="rounded-full bg-muted p-6">
          <Lock className="h-12 w-12 text-primary" />
        </div>
      </div> */}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance" disabled className="flex items-center gap-2 text-muted-foreground cursor-not-allowed">
            <Lock className="w-4 h-4" />
            Appearance
          </TabsTrigger>

          <TabsTrigger value="notifications" disabled className="flex items-center gap-2 text-muted-foreground cursor-not-allowed">
            <Lock className="w-4 h-4" />
            Notifications
          </TabsTrigger>

          <TabsTrigger value="api" disabled className="flex items-center gap-2 text-muted-foreground cursor-not-allowed">
            <Lock className="w-4 h-4" />
            API Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input id="firstname" defaultValue={user.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input id="lastname" defaultValue={user.lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue={user.company} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={user.designation} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccountInfo} disabled={isSavingAccount}>
                {isSavingAccount ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Info</CardTitle>
              <CardDescription>Information to be included in the email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about-info">What do you want to tell about yourself in email?</Label>
                <Textarea id="about-info" className='h-48' defaultValue={user.about} />
              </div>
            </CardContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-info">What services your company provide?</Label>
                <Textarea id="email-info" className='h-48' defaultValue={user.email_info} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmailInfo} disabled={isSavingEmail}>
                {isSavingEmail ? "Saving" : "Save"}
              </Button>
            </CardFooter>
          </Card>
          {/* <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card> */}
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch id="dark-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for tables and lists</p>
                  </div>
                  <Switch id="compact-view" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme Color</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="olive">Olive Green (Default)</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="teal">Teal</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                  </div>
                  <Switch id="browser-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-updates">Market Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about market updates</p>
                  </div>
                  <Switch id="market-updates" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="competitor-updates">Competitor Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about competitor updates</p>
                  </div>
                  <Switch id="competitor-updates" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Manage your API keys and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex">
                    <Input id="api-key" defaultValue="sk_live_51NzUZJDJ7bN5Fgd..." readOnly className="flex-1" />
                    <Button variant="outline" className="ml-2">
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Use this key to authenticate API requests</p>
                </div>

                <div className="space-y-2">
                  <Label>API Usage</Label>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Requests this month</span>
                      <span className="text-sm font-medium">1,234 / 5,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[25%] rounded-full bg-primary"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Documentation</Label>
                  <p className="text-sm text-muted-foreground">
                    Access our API documentation to learn how to integrate with our platform.
                  </p>
                  <Button variant="outline">View Documentation</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Regenerate API Key</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
