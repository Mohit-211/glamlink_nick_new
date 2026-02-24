# Mailchimp Template Mode for Welcome Emails

## Overview

This feature allows you to use a pre-made Mailchimp campaign as a template for welcome emails, avoiding sender verification issues and ensuring consistent branding.

## How It Works

Instead of creating campaigns from scratch, the system:
1. **Replicates** (clones) your pre-made template campaign
2. Updates the clone with the subscriber's email address
3. Sends the cloned campaign immediately
4. Each subscriber gets their own unique campaign instance

## Setup Instructions

### 1. Create Your Template Campaign in Mailchimp

1. Log into Mailchimp
2. Create a new campaign with your perfect welcome email design
3. Save it as a draft (don't send it)
4. Note the campaign ID from the URL (e.g., `263` from `https://us16.admin.mailchimp.com/campaigns/edit?id=263`)

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Enable template mode (set to true to activate)
MAILCHIMP_USE_TEMPLATE_MODE=true

# Your template campaign ID (from step 1)
MAILCHIMP_TEMPLATE_CAMPAIGN_ID=263

# Make sure your FROM email is verified in Mailchimp
MAILCHIMP_FROM_EMAIL=your-verified-email@glamlink.com
```

### 3. Verify Your Sender Email

**IMPORTANT**: The email address in `MAILCHIMP_FROM_EMAIL` must be verified in Mailchimp:

1. Go to Mailchimp → Settings → Domains
2. Verify your domain (e.g., `glamlink.com`)
3. Go to Settings → Verified Domains → Email Addresses
4. Add and verify your FROM email address

## How to Use

Once configured, the system will automatically:

1. **Check if template mode is enabled** when sending welcome emails
2. **Replicate your template** instead of creating from HTML
3. **Target the specific subscriber** using email segmentation
4. **Send immediately** to the new subscriber

## Fallback Behavior

If template replication fails, the system will:
1. Log the error
2. Fall back to the original HTML-based campaign creation
3. Continue with the subscription process

## Testing

To test the template mode:

1. Set `MAILCHIMP_USE_TEMPLATE_MODE=true` in your `.env`
2. Set `MAILCHIMP_TEMPLATE_CAMPAIGN_ID` to your template ID
3. Subscribe with a test email
4. Check the logs for "📋 TEMPLATE MODE ACTIVATED"
5. Verify the email was sent in Mailchimp's campaign reports

## Benefits

✅ **No sender verification errors** - Template already has verified sender
✅ **Consistent design** - Use your perfected email template
✅ **Faster sending** - Replication is quicker than creation
✅ **Easy updates** - Change template in Mailchimp, not code
✅ **Each subscriber gets unique campaign** - No conflicts

## Troubleshooting

### "Your Campaign is not ready to send" Error
- Your FROM email is not verified in Mailchimp
- Solution: Verify the email address in Mailchimp settings

### Template Not Found
- The template campaign ID doesn't exist
- Solution: Check the ID in your Mailchimp dashboard

### Replication Failed
- Template might be deleted or inaccessible
- Solution: Create a new template and update the ID

## Alternative: Mailchimp Automation

For a more robust long-term solution, consider setting up a **Welcome Email Automation** in Mailchimp:

1. Go to Automations → Create → Welcome new subscribers
2. Design your welcome email
3. Set trigger to "When someone subscribes"
4. Activate the automation
5. No API calls needed - Mailchimp handles everything

This removes the need for any API-based email sending for welcome messages.