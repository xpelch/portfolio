# Journey telemetry is validate-and-ack, non-persistent, privacy-safe

The site records Journey Events (`contact_click`, `project_open`,
`external_profile_click`, `language_switch`) to observe the Visitor Journey.
The `/api/journey` endpoint validates each payload against that four-event
taxonomy and returns an acknowledgment, but stores nothing — no database, no
cookies, no consent UI, and the UI never blocks navigation or language
switching on telemetry. Chosen because the journey is a product signal worth
having cheaply and honestly, and a privacy-safe posture beats the analytics
noise it would take to extract more. A future engineer should not "upgrade"
this to persistent tracking without revisiting the privacy trade-off.
