import React, { useEffect, useState } from 'react';
import calendar from './calendar.svg';
import './App.css';

function App() {

  const [eventsList, setEventsList] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(false);

  // Client ID and API key from the Developer Console
  const CLIENT_ID = '180437786480-pnhe6s979vc6dhskr6c37n5ovh5aqusr.apps.googleusercontent.com';

  // Array of API discovery doc URLs for APIs used by the quickstart
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = "https://www.googleapis.com/auth/calendar";

  const  event = {
    'summary': 'New Google event on 14',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2020-09-14T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles'
    },
    'end': {
      'dateTime': '2020-09-14T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles'
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [],
    'reminders': {}
  };

  const initClient = () => {
    window.gapi.client.init({
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      // Listen for sign-in state changes.
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    }, (error) => {
      console.log(JSON.stringify(error, null, 2));
    });
  };

  useEffect(() => {
    window.gapi && window.gapi.load('client:auth2', initClient);
  }, []);

  const updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      setLoggedIn(true);
      listUpcomingEvents();
    } else {
      setLoggedIn(false);
    }
  };

  const listUpcomingEvents = () => {
    window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then((response) => {
      const events = response.result.items;
      setEventsList(events);
    });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    window.gapi.auth2.getAuthInstance().signIn().then((response) => {
      listUpcomingEvents();
    });
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignoutClick = (event) => {
    window.gapi.auth2.getAuthInstance().signOut();
    setLoggedIn(false);
  };

  const createEvent = () => {
    window.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    }).then(function(event) {
      console.log('event created', event, JSON.stringify(event));
      listUpcomingEvents();
    });
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={calendar} className="App-logo" alt="logo" />
        <p>
          Google Calendar API
        </p>
        <div className="App-flex">
          {!isLoggedIn && <button type="button" class="btn btn-primary" onClick={handleAuthClick}>Authorize</button>}
          {isLoggedIn && <button type="button" class="btn btn-primary mr-1" onClick={handleSignoutClick}>Sign Out</button>}
          {isLoggedIn && <button type="button" class="btn btn-primary mr-1" onClick={listUpcomingEvents}>Refresh Event</button>}
          {isLoggedIn && <button type="button" class="btn btn-primary mr-1" onClick={createEvent}>Create Event</button>}
        </div>
        {isLoggedIn && <div>
          {eventsList.length > 0 ? <div>
            <ul>
              {eventsList.map((event, i) => {
                const when = event.start.dateTime;
                if (!when) {
                  when = event.start.date;
                }
                return <li key={i}>{event.summary} - ( {when} )</li>
              })
            }
            </ul>
          </div> : <div>No upcoming events found</div>}
        </div>}
      </header>
    </div>
  );
}

export default App;
