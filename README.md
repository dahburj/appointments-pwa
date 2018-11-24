<p align="center">
    <img src="/src/assets/logo.svg" height="200">
</p>

<img src="https://upload.wikimedia.org/wikipedia/commons/5/59/Empty.png" height="16px">

# Appointments PWA [![Build Status](https://travis-ci.com/KaindlJulian/appointments-pwa.svg?token=mp2NSp7o4LF4zjnzTqDd&branch=master)](https://travis-ci.com/KaindlJulian/appointments-pwa) [![Depfu](https://badges.depfu.com/badges/d5e9d1941ab5667c4d92cc4341b78177/count.svg)](https://depfu.com/github/KaindlJulian/appointments-pwa?project_id=6290)

> Serverless Angular PWA using some Firebase features and Google APIs

Website: https://appointments-pwa.firebaseapp.com

## System 
<img src="docs/system-architecture.svg" alt="system-architecture" height="500">

## Firebase

### :fire: [Authentication](https://firebase.google.com/docs/auth/)

  - Email/Password
  - Google

### <div>🔥<a href="https://firebase.google.com/docs/firestore/">Firestore &#946;</a></div>

  - Data structure

```
  appointments/{appointmentId}: {
      title,
      body,
      date,
      author: {name, email, photoURL},
      attendees: [{name, email, photoURL}, ...]
  },
  users/{uid}: {
      name, 
      email, 
      photoURL
  }
```

### :fire: [Functions](https://firebase.google.com/docs/functions/)
One function to send Push Notifications. ([src](/functions/src/index.ts))
  - Listens for created appointments in Firestore (`onCreate` [trigger](https://firebase.google.com/docs/functions/firestore-events)) 
  - Reads all attendees of the appointment that are actual users (not google contacts)
  - Sends a Push Notification to the users fcmToken and the client side will do the rest

### :fire: [Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/)

<img src="docs/fcmSteps.png" alt="fcmSteps" height="400" />

### :fire: [Hosting](https://firebase.google.com/docs/hosting/)

Deploying the production build from travis ([.travis.yml](.travis.yml)

## Google APIs

The Google login with their api [client](https://developers.google.com/api-client-library/javascript/start/start-js) includes scopes for following Google APIs

- People API (`/auth/calendar`)
- Google Calendar API (`/contacts/readonly`)

## Virtual scrolling

To create a high performance realtime list which only renders elements that fit on the screen (similar to the Android RecyclerView that also only creates as much ViewHolders as needed). More [here](https://material.angular.io/cdk/scrolling/overview#virtual-scrolling).

## Getting started

Clone the repository

> git clone https://github.com/KaindlJulian/appointments-pwa.git

Install dependencies

> npm install

Development server

> ng serve --open