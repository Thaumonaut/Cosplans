<script lang="ts">
  import { onMount } from 'svelte';
  import { Camera, Save, Trash2, AlertTriangle } from 'lucide-svelte';
  import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Input,
    Label,
    Textarea,
    Switch
  } from '$lib/components/ui';
  import Dialog from '$lib/components/ui/dialog.svelte';
  import DialogFooter from '$lib/components/ui/dialog-footer.svelte';
  import { userService } from '$lib/api/services/userService';
  import { user, userProfile } from '$lib/stores/auth-store';
  import { toast } from '$lib/stores/toast';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  let loading = $state(true);
  let saving = $state(false);
  let deleting = $state(false);
  let showDeleteDialog = $state(false);
  let deleteConfirmText = $state('');

  let profile = $state<{
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  }>({
    id: '',
    email: '',
  });

  // Form state
  let displayName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let bio = $state('');
  let avatarUrl = $state('');

  // Load profile data
  onMount(async () => {
    try {
      loading = true;
      const currentUser = get(user);
      if (!currentUser) {
        toast.error('Not Authenticated', 'Please sign in to view your profile');
        return;
      }

      const userProfileData = await userService.getProfile();
      if (userProfileData) {
        profile = userProfileData;
        displayName = userProfileData.name || '';
        firstName = userProfileData.firstName || '';
        lastName = userProfileData.lastName || '';
        bio = userProfileData.bio || '';
        avatarUrl = userProfileData.avatarUrl || '';
      } else {
        // Use data from auth store as fallback
        const profileData = get(userProfile);
        if (profileData) {
          displayName = profileData.firstName && profileData.lastName
            ? `${profileData.firstName} ${profileData.lastName}`
            : profileData.firstName || '';
          firstName = profileData.firstName || '';
          lastName = profileData.lastName || '';
          avatarUrl = profileData.avatarUrl || '';
        }
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to Load Profile', error?.message || 'Could not load your profile information');
    } finally {
      loading = false;
    }
  });

  async function handleSave() {
    if (saving) return;

    saving = true;
    try {
      await userService.updateProfile({
        name: displayName.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      toast.success('Profile Updated', 'Your profile has been saved successfully');

      // Refresh profile data
      const updatedProfile = await userService.getProfile();
      if (updatedProfile) {
        profile = updatedProfile;
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to Update Profile', error?.message || 'Could not save your profile');
    } finally {
      saving = false;
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Invalid Confirmation', 'Please type DELETE to confirm account deletion');
      return;
    }

    deleting = true;
    try {
      await userService.deleteAccount();
      toast.success('Account Deleted', 'Your account has been permanently deleted');
      // Redirect to home page after a short delay
      setTimeout(() => {
        goto('/');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to Delete Account', error?.message || 'Could not delete your account');
      deleting = false;
    }
  }

  function getInitials() {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (displayName) {
      return displayName.substring(0, 2).toUpperCase();
    }
    const email = get(user)?.email || '';
    return email.substring(0, 2).toUpperCase() || 'U';
  }

  const currentUser = $derived(get(user));
  const email = $derived(currentUser?.email || profile.email || '');
</script>

<svelte:head>
  <title>Profile Settings - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Profile Settings</h1>
      <p class="text-muted-foreground">Update your personal information and profile picture</p>
    </div>
    <Button onclick={handleSave} disabled={saving || loading}>
      <Save class="mr-2 size-4" />
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <div class="text-sm text-muted-foreground">Loading profile...</div>
    </div>
  {:else}
    <!-- Profile Information -->
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and profile picture</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Avatar Upload -->
        <div class="flex items-center gap-6">
          <Avatar class="size-24">
            <AvatarImage src={avatarUrl || '/placeholder-user.jpg'} alt="Profile picture" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div class="space-y-2">
            <Button variant="outline" type="button" disabled>
              <Camera class="mr-2 size-4" />
              Change Photo
            </Button>
            <p class="text-sm text-muted-foreground">Avatar upload coming soon</p>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Display Name</Label>
            <Input
              bind:value={displayName}
              placeholder="Your display name"
            />
          </div>
          <div class="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              disabled
              class="bg-muted"
            />
            <p class="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div class="space-y-2">
            <Label>First Name</Label>
            <Input
              bind:value={firstName}
              placeholder="First name"
            />
          </div>
          <div class="space-y-2">
            <Label>Last Name</Label>
            <Input
              bind:value={lastName}
              placeholder="Last name"
            />
          </div>
        </div>

        <!-- Bio -->
        <div class="space-y-2">
          <Label>Bio</Label>
          <Textarea
            bind:value={bio}
            placeholder="Tell us about yourself..."
            rows={4}
          />
          <p class="text-sm text-muted-foreground">Brief description for your profile</p>
        </div>
      </CardContent>
    </Card>

    <!-- Account Security -->
    <Card>
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
        <CardDescription>Manage your password and security settings</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Current Password</Label>
          <Input type="password" disabled />
          <p class="text-xs text-muted-foreground">Password management coming soon</p>
        </div>
        <div class="space-y-2">
          <Label>New Password</Label>
          <Input type="password" disabled />
        </div>
        <div class="space-y-2">
          <Label>Confirm New Password</Label>
          <Input type="password" disabled />
        </div>
        <Button disabled>Update Password</Button>
      </CardContent>
    </Card>

    <!-- Danger Zone -->
    <Card class="border-destructive">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-destructive">
          <AlertTriangle class="size-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible actions that will permanently affect your account</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h3 class="font-semibold text-destructive mb-2">Delete Account</h3>
          <p class="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. This will permanently delete:
          </p>
          <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
            <li>Your profile and personal information</li>
            <li>All teams you created</li>
            <li>All projects, tasks, and data associated with your account</li>
            <li>Your team memberships</li>
          </ul>
          <Button
            variant="destructive"
            onclick={() => showDeleteDialog = true}
            class="w-full sm:w-auto"
          >
            <Trash2 class="mr-2 size-4" />
            Delete My Account
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Delete Account Confirmation Dialog -->
<Dialog
  bind:open={showDeleteDialog}
  title="Delete Account"
  description="This action cannot be undone. This will permanently delete your account and remove all associated data from our servers."
>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label>Type <span class="font-mono font-bold">DELETE</span> to confirm</Label>
      <Input
        bind:value={deleteConfirmText}
        placeholder="DELETE"
        class="font-mono text-foreground"
      />
    </div>
    <div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <p class="font-semibold mb-1">Warning:</p>
      <p>All your data will be permanently deleted. This includes all teams, projects, tasks, and personal information.</p>
    </div>
  </div>
  <DialogFooter>
    <Button
      variant="outline"
      onclick={() => {
        showDeleteDialog = false;
        deleteConfirmText = '';
      }}
      disabled={deleting}
    >
      Cancel
    </Button>
    <Button
      variant="destructive"
      onclick={handleDeleteAccount}
      disabled={deleting || deleteConfirmText !== 'DELETE'}
    >
      <Trash2 class="mr-2 size-4" />
      {deleting ? 'Deleting...' : 'Delete Account'}
    </Button>
  </DialogFooter>
</Dialog>
