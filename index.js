const { google } = require('googleapis')
require('dotenv').config()



function sendCalenderInvite(startTime, endTime, title, description, attachments, attendees){
    const { OAuth2 } = google.auth
    
    const oAuth2Client = new OAuth2(
        process.env.client_id,
        process.env.client_secret
      )
    
    oAuth2Client.setCredentials({
        refresh_token: process.env.refresh_token,
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })


    attendees = attendees.map(user => {
        return {email: user}
    })
    
    
    // Create a event in our calendar
    const event = {
      summary: title,
      description: description,
      colorId: 1,
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Kolkata',
      },
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Kolkata',
      },
      attendees,
      conferenceData: {
        createRequest: {
            conferenceSolutionKey: {
                type: "hangoutsMeet"
          },
          requestId: new Date().toString()
        }
      },
      attachments
    
    }
    
    // Check if we a busy and have an event on our calendar for the same time.
    calendar.freebusy.query(
      {
        resource: {
          timeMin: startTime,
          timeMax: endTime,
          timeZone: 'Asia/Kolkata',
          items: [{ id: 'primary' }], // replace 'primary' with the email to check for calender schedule 
        },                              // otherwise 'primary' will be used as authenticated user
      },
      (err, res) => {
        // Check for errors in our query and log them if they exist.
        if (err) return console.error('Free Busy Query Error: ', err)
    
        // Create an array of all events on our calendar during that time.
        var owner = Object.keys(res.data.calendars)[0]
        const eventArr = res.data.calendars[owner].busy
    
        // Check if event array is empty which means we are not busy
        if (eventArr.length === 0)
          // If we are not busy create a new calendar event.
          {
              return calendar.events.insert( { calendarId: 'primary', resource: event, sendUpdates: 'all', conferenceDataVersion: 1, supportsAttachments: true },
                err => {
                  // Check for errors and log them if they exist.
                  if (err) return console.error('Error Creating Calender Event:', err)
                  // Else log that the event was created.
                  return console.log('Calendar event successfully created.')
                }
              )
          }
    
        // If event array is not empty log that we are busy.
        return console.log(`Sorry I'm busy...`)
      }
    )

}

let startTime = new Date("2021-06-24T13:00:00") //time format should include date and time
let endTime = new Date("2021-06-24T14:00:00")
let title = 'Interview Google meet' // title of invite

let description = "Contact-7014059056 \nNote: No salary discussions during interview. \nOffice Address: 529-532,Vipul Trade Center Sector 48 Sohna Road,Gurgaon \n\"<b>In case of any concern related to interview please call me</b>\" \nChandni Singh \n8209358052"

//array of users to send the calender invitation
let attendees = ['chaitanya44123@gmail.com', 'chaitanyatest22@gmail.com'];

//attachements array of objects with specified keys only
let attachments = [{fileUrl: "https://drive.google.com/file/d/1C-SAsZYbQ-MyIEgFZvY7KOymCKd8lbQJ/view", title: "Resume.pdf"}]

sendCalenderInvite(startTime, endTime, title, description, attachments, attendees);