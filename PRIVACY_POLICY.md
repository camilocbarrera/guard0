# Privacy Policy - Guard0 Extension

**Last Updated: December 2024**

## Overview

Guard0 is a Chrome extension that helps protect users from scams and phishing websites by analyzing web pages in real-time using AI-powered detection. This privacy policy explains what information we collect, how we use it, and how we protect your privacy.

## Information We Collect

### 1. Website Analysis Data
When you visit a website with Guard0 enabled, the extension automatically extracts and analyzes the following information from the current webpage:

- **URL and Domain**: The website address you're visiting
- **Page Title**: The title displayed in the browser tab
- **Meta Tags**: Standard HTML meta information (description, keywords, etc.)
- **Visible Text Content**: The text content visible on the page (up to 6,000 characters)
- **Links**: URLs and link text from hyperlinks on the page (up to 20 links)
- **Forms**: Form actions, methods, and input field information (up to 5 forms)

**Important**: We do NOT collect or execute any JavaScript code from websites. We only read the rendered HTML content and visible text.

### 2. User Settings and Preferences
- **API Key**: Your Groq API key (stored locally in Chrome's encrypted storage)
- **Extension Settings**: Whether the extension is enabled/disabled
- **Allowlist**: Domains you've chosen to exclude from analysis

### 3. Usage Analytics
- **Analysis Results**: Cached safety verdicts per website domain (stored temporarily in browser session)
- **Extension Performance**: Basic usage statistics to improve the extension

## How We Use Your Information

### 1. Scam Detection
- Website data is sent to Groq's AI service for real-time analysis
- Analysis helps determine if a website exhibits scam or phishing characteristics
- Results are cached to avoid repeated analysis of the same domain

### 2. Extension Functionality
- API key is used to authenticate with Groq's service
- Settings control when and how the extension operates
- Cached results improve performance and reduce API calls

### 3. Service Improvement
- Usage patterns help us improve detection accuracy
- Error reporting helps fix technical issues

## Data Storage and Retention

### Local Storage (Your Device)
- **API Key**: Stored securely in Chrome's local storage until you remove it
- **Settings**: Stored locally and persist across browser sessions
- **Allowlist**: Stored locally for your personal use

### Temporary Session Storage
- **Analysis Results**: Cached for the current browser session only
- **Automatically cleared** when you close all Chrome windows

### Third-Party Storage (Groq)
- **Website Summaries**: Sent to Groq for analysis but not permanently stored
- **Analysis Results**: Returned from Groq but only the final verdict is cached locally

## Data Sharing and Third Parties

### Groq AI Service
- We use Groq's API (https://api.groq.com) for website analysis
- Website summaries are transmitted to Groq for processing
- Groq's privacy policy applies to data sent to their service
- We do not share your API key with any other third parties

### No Other Sharing
- We do not sell, rent, or share your personal information with advertisers or other companies
- We do not collect browsing history or track your online activity beyond the current page being analyzed

## Data Security

### Encryption
- API keys are stored using Chrome's secure storage mechanisms
- All communications with Groq use HTTPS encryption

### Access Controls
- Data is processed locally on your device whenever possible
- Only necessary website summaries are sent to external services

### Data Minimization
- We collect only the minimum data required for scam detection
- Analysis is performed on compact summaries, not full page content

## Your Rights and Controls

### Control Your Data
- **Disable Extension**: Turn off Guard0 anytime through Chrome extensions
- **Clear Data**: Remove stored API keys and settings through extension options
- **Allowlist Management**: Add domains to skip analysis
- **Uninstall**: Completely remove the extension and all stored data

### Access and Deletion
- View your stored settings through the extension options page
- Delete your API key and reset all settings at any time
- Uninstalling the extension removes all locally stored data

## Children's Privacy

Guard0 is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this privacy policy as the extension evolves. Significant changes will be communicated through:
- Extension update notifications
- Updated documentation on our GitHub repository

## Contact Us

If you have questions about this privacy policy or Guard0's data practices:

- **GitHub Repository**: [https://github.com/camilocbarrera/guard0](https://github.com/camilocbarrera/guard0)
- **Issues**: Create an issue on GitHub for privacy-related concerns

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) where applicable
- California Consumer Privacy Act (CCPA) requirements

By using Guard0, you acknowledge that you have read and understood this privacy policy.
