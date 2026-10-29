import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import './App.css'

function App() {



  const navigate = useNavigate()
  const location = useLocation()

const showLogin = location.pathname === '/login'
const showRegister = location.pathname === '/register'
  

  const [showIncidentForm, setShowIncidentForm] = useState(false)

  const [incidentLoading, setIncidentLoading] = useState(false)

  const [incidentMessage, setIncidentMessage] = useState('')

  const [myReports, setMyReports] = useState([])

  const [reportsLoading, setReportsLoading] = useState(false)

  const [reportsMessage, setReportsMessage] = useState('')

  const [showMyReports, setShowMyReports] = useState(false)

  const [adminIncidents, setAdminIncidents] = useState([])

  const [adminIncidentsLoading, setAdminIncidentsLoading] = useState(false)

  const [adminIncidentsMessage, setAdminIncidentsMessage] = useState('')

  const [showAdminIncidents, setShowAdminIncidents] = useState(false)

  const [incidentSearch, setIncidentSearch] = useState('')

  const [incidentStatusFilter, setIncidentStatusFilter] = useState('All')

  const [incidentCategoryFilter, setIncidentCategoryFilter] = useState('All')

  const [selectedIncident, setSelectedIncident] = useState(null)

  const [adminStats, setAdminStats] = useState(null)

  const [adminStatsLoading, setAdminStatsLoading] = useState(false)

  const [adminStatsMessage, setAdminStatsMessage] = useState('')

  const [showAdminStats, setShowAdminStats] = useState(false)

  const [statusUpdatingId, setStatusUpdatingId] = useState('')

  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false)

  const [emergencies, setEmergencies] = useState([])

  const [emergencyLoading, setEmergencyLoading] = useState(false)

  const [emergencySubmitting, setEmergencySubmitting] = useState(false)

  const [emergencyConfirming, setEmergencyConfirming] = useState(false)

  const [emergencyMessage, setEmergencyMessage] = useState('')

  const [emergencyLocation, setEmergencyLocation] = useState('')

  const [locationMessage, setLocationMessage] = useState('')

  const [notificationMessage, setNotificationMessage] = useState('')

  const knownEmergencyIds = useRef(new Set())

  const firstEmergencyPoll = useRef(true)


  const [adminEmergencies, setAdminEmergencies] = useState([])
  const [adminEmergenciesLoading, setAdminEmergenciesLoading] = useState(false)
  const [adminEmergenciesMessage, setAdminEmergenciesMessage] = useState('')
  const [showAdminEmergencies, setShowAdminEmergencies] = useState(false)
  const [emergencyUpdatingId, setEmergencyUpdatingId] = useState('')

  const [currentUser, setCurrentUser] = useState(() => {

    try {

      return JSON.parse(localStorage.getItem('user') || 'null')

    } catch {

      return null

    }

  })

  const [authLoading, setAuthLoading] = useState(false)

  const captureEmergencyLocation = () => {
    setLocationMessage('')

    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser. Enter your location manually.')
      return
    }

    setLocationMessage('Requesting your location permission…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const formatted = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy approx. ${Math.round(accuracy)} m)`
        setEmergencyLocation(formatted)
        setLocationMessage('Location captured. Review it before sending.')
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. You can enter your location manually.',
          2: 'Your location is currently unavailable. Enter it manually.',
          3: 'Location request timed out. Try again or enter it manually.',
        }
        setLocationMessage(messages[error.code] || 'Could not get your location. Enter it manually.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  const enableBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMessage('This browser does not support desktop notifications.')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      setNotificationMessage(
        permission === 'granted'
          ? 'Browser notifications enabled. Keep SafeCampus open to receive new emergency alerts.'
          : 'Notifications were not enabled. You can still review alerts in the dashboard.'
      )
    } catch {
      setNotificationMessage('Could not request notification permission in this browser.')
    }
  }

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin' || !localStorage.getItem('token')) return undefined

    let isActive = true

    const pollEmergencyAlerts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emergency/admin', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        if (!response.ok) return
        const data = await response.json()
        const items = Array.isArray(data.emergencies) ? data.emergencies : []
        if (!isActive) return

        const currentIds = new Set(items.map((item) => String(item._id || item.id)))
        if (!firstEmergencyPoll.current) {
          const newActiveAlerts = items.filter((item) => {
            const id = String(item._id || item.id)
            return id && !knownEmergencyIds.current.has(id) && (item.status || 'Active') === 'Active'
          })

          if (newActiveAlerts.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('SafeCampus: New emergency alert', {
              body: newActiveAlerts.length === 1
                ? `${newActiveAlerts[0].message || 'Emergency assistance requested'}${newActiveAlerts[0].location ? ` — ${newActiveAlerts[0].location}` : ''}`
                : `${newActiveAlerts.length} new active emergency alerts need attention.`,
              tag: 'safecampus-emergency-alert',
            })
          }
        }

        knownEmergencyIds.current = currentIds
        firstEmergencyPoll.current = false
        setAdminEmergencies(items)
      } catch (error) {
        console.error('Background emergency check failed:', error)
      }
    }

    pollEmergencyAlerts()
    const intervalId = window.setInterval(pollEmergencyAlerts, 30000)
    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [currentUser])

  const closeAuthModal = () => {
navigate('/login')

  if (location.pathname === '/login' || location.pathname === '/register') {
    navigate('/')
  }
}

  const handleLogout = () => {

    localStorage.removeItem('token')

    localStorage.removeItem('user')

    setCurrentUser(null)

    setShowIncidentForm(false)

    closeAuthModal()

  }

  const handleIncidentSubmit = async (event) => {

    event.preventDefault()

    setIncidentLoading(true)

    setIncidentMessage('')

    const formElement = event.currentTarget

    const formData = new FormData(formElement)

    const payload = {

      title: formData.get('title'),

      category: formData.get('category'),

      location: formData.get('location'),

      description: formData.get('description'),

    }

    try {

      const response = await fetch('http://localhost:5000/api/incidents', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${localStorage.getItem('token')}`,

        },

        body: JSON.stringify(payload),

      })

      const data = await response.json()

      if (!response.ok) {

        setIncidentMessage(data.message || 'Unable to submit the incident.')

        return

      }

      setIncidentMessage('Incident reported successfully!')

      formElement.reset()

    } catch (error) {

      console.error('Incident submission error:', error)

      setIncidentMessage(

        'Cannot connect to the backend. Check that the server is running on port 5000.'

      )

    } finally {

      setIncidentLoading(false)

    }

  }

  const handleFetchMyReports = async () => {

    setShowMyReports(true)

    setReportsLoading(true)

    setReportsMessage('')

    try {

      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/incidents/my', {

        method: 'GET',

        headers: {

          Authorization: `Bearer ${token}`,

        },

      })

      const data = await response.json()

      if (!response.ok) {

        setMyReports([])

        setReportsMessage(data.message || 'Unable to load your reports.')

        return

      }

      const reports = Array.isArray(data)

        ? data

        : Array.isArray(data.incidents)

          ? data.incidents

          : Array.isArray(data.reports)

            ? data.reports

            : []

      setMyReports(reports)

      if (reports.length === 0) {

        setReportsMessage('You have not submitted any incidents yet.')

      }

    } catch (error) {

      console.error('My reports error:', error)

      setMyReports([])

      setReportsMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setReportsLoading(false)

    }

  }

  const handleFetchMyEmergencies = async () => {

    setShowEmergencyPanel(true)

    setEmergencyLoading(true)

    setEmergencyMessage('')

    try {

      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/emergency/my', {

        headers: { Authorization: `Bearer ${token}` },

      })

      const data = await response.json()

      if (!response.ok) {

        setEmergencies([])

        setEmergencyMessage(data.message || 'Unable to load emergency alerts.')

        return

      }

      const items = Array.isArray(data.emergencies) ? data.emergencies : []

      setEmergencies(items)

      if (items.length === 0) setEmergencyMessage('You have no emergency alerts yet.')

    } catch (error) {

      console.error('Fetch emergency alerts error:', error)

      setEmergencies([])

      setEmergencyMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setEmergencyLoading(false)

    }

  }

  const handleEmergencySubmit = async (event) => {

    event.preventDefault()

    setEmergencySubmitting(true)

    setEmergencyMessage('')

    const formElement = event.currentTarget

    const formData = new FormData(formElement)

    const payload = {

      message: formData.get('message'),

      location: formData.get('location') || emergencyLocation,

    }

    try {

      const response = await fetch('http://localhost:5000/api/emergency', {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${localStorage.getItem('token')}`,

        },

        body: JSON.stringify(payload),

      })

      const data = await response.json()

      if (!response.ok) {

        setEmergencyMessage(data.message || 'Unable to create emergency alert.')

        return

      }

      formElement.reset()

      setEmergencyConfirming(false)

      await handleFetchMyEmergencies()

      setEmergencyMessage('Emergency alert sent successfully.')

    } catch (error) {

      console.error('Create emergency alert error:', error)

      setEmergencyMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setEmergencySubmitting(false)

    }

  }

  const handleFetchAdminIncidents = async () => {

    setShowAdminIncidents(true)

    setAdminIncidentsLoading(true)

    setAdminIncidentsMessage('')

    try {

      const response = await fetch('http://localhost:5000/api/incidents/', {

        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },

      })

      const data = await response.json()

      if (!response.ok) {

        setAdminIncidents([])

        setAdminIncidentsMessage(data.message || 'Unable to load incidents.')

        return

      }

      const incidents = Array.isArray(data)

        ? data

        : Array.isArray(data.incidents)

          ? data.incidents

          : Array.isArray(data.reports)

            ? data.reports

            : []

      setAdminIncidents(incidents)

      if (incidents.length === 0) setAdminIncidentsMessage('No incidents have been reported yet.')

    } catch (error) {

      console.error('Admin incidents error:', error)

      setAdminIncidents([])

      setAdminIncidentsMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setAdminIncidentsLoading(false)

    }

  }

  const handleUpdateIncidentStatus = async (incidentId, status) => {

    setStatusUpdatingId(incidentId)

    setAdminIncidentsMessage('')

    try {

      const response = await fetch(`http://localhost:5000/api/incidents/${incidentId}/status`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

          Authorization: `Bearer ${localStorage.getItem('token')}`,

        },

        body: JSON.stringify({ status }),

      })

      const data = await response.json()

      if (!response.ok) {

        setAdminIncidentsMessage(data.message || 'Unable to update incident status.')

        return

      }

      const updatedIncident = data.incident || data

      setAdminIncidents((previous) =>

        previous.map((incident) =>

          incident._id === incidentId

            ? { ...incident, ...(updatedIncident && typeof updatedIncident === 'object' ? updatedIncident : {}), status }

            : incident

        )

      )

      setAdminIncidentsMessage(`Incident status updated to "${status}".`)

    } catch (error) {

      console.error('Incident status update error:', error)

      setAdminIncidentsMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setStatusUpdatingId('')

    }

  }

  const handleFetchAdminStats = async () => {

    setShowAdminStats(true)

    setAdminStatsLoading(true)

    setAdminStatsMessage('')

    try {

      const response = await fetch('http://localhost:5000/api/incidents/admin/statistics', {

        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },

      })

      const data = await response.json()

      if (!response.ok) {

        setAdminStats(null)

        setAdminStatsMessage(data.message || 'Unable to load incident statistics.')

        return

      }

      setAdminStats(data.statistics || data.stats || data)

    } catch (error) {

      console.error('Admin statistics error:', error)

      setAdminStats(null)

      setAdminStatsMessage('Cannot connect to the backend. Check that the server is running on port 5000.')

    } finally {

      setAdminStatsLoading(false)

    }

  }


  const handleFetchAdminEmergencies = async () => {
    setShowAdminEmergencies(true)
    setAdminEmergenciesLoading(true)
    setAdminEmergenciesMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/emergency/admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        setAdminEmergencies([])
        setAdminEmergenciesMessage(data.message || 'Unable to load emergency alerts.')
        return
      }

      const items = Array.isArray(data.emergencies) ? data.emergencies : []
      setAdminEmergencies(items)
      if (items.length === 0) {
        setAdminEmergenciesMessage('No emergency alerts have been submitted.')
      }
    } catch (error) {
      console.error('Admin emergencies error:', error)
      setAdminEmergencies([])
      setAdminEmergenciesMessage('Cannot connect to the backend. Check that the server is running on port 5000.')
    } finally {
      setAdminEmergenciesLoading(false)
    }
  }

  const handleUpdateEmergencyStatus = async (emergencyId, status) => {
    setEmergencyUpdatingId(emergencyId)
    setAdminEmergenciesMessage('')

    try {
      const response = await fetch(`http://localhost:5000/api/emergency/${emergencyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()

      if (!response.ok) {
        setAdminEmergenciesMessage(data.message || 'Unable to update emergency status.')
        return
      }

      if (data.emergency) {
        setAdminEmergencies((previous) =>
          previous.map((item) => item._id === emergencyId ? data.emergency : item)
        )
      }
      setAdminEmergenciesMessage(`Emergency status updated to "${status}".`)
    } catch (error) {
      console.error('Emergency status update error:', error)
      setAdminEmergenciesMessage('Cannot connect to the backend. Check that the server is running on port 5000.')
    } finally {
      setEmergencyUpdatingId('')
    }
  }

  const handleAuthSubmit = async (event) => {

    event.preventDefault()

    setAuthLoading(true)

    const formData = new FormData(event.currentTarget)

    const endpoint = showLogin

      ? 'http://localhost:5000/api/auth/login'

      : 'http://localhost:5000/api/auth/register'

    const payload = {

      email: formData.get('email'),

      password: formData.get('password'),

    }

    if (showRegister) {

      payload.fullName = formData.get('fullName')

      payload.studentId = formData.get('studentId')

    }

    try {

      const response = await fetch(endpoint, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(payload),

      })

      const data = await response.json()

      if (!response.ok) {

        alert(data.message || 'Authentication failed.')

        return

      }

      if (showRegister) {

        alert('Registration successful! Please log in.')

        navigate('/login')

        return

      }

      if (!data.token || !data.user) {

        alert('Login response is missing the token or user information.')

        return

      }

      localStorage.setItem('token', data.token)

      localStorage.setItem('user', JSON.stringify(data.user))

      setCurrentUser(data.user)

      closeAuthModal()

    } catch (error) {

      console.error('Authentication error:', error)

      alert(

        'Cannot connect to the backend. Check that your server is running on port 5000.'

      )

    } finally {

      setAuthLoading(false)

    }

  }

  // DASHBOARD: shown after login

  if (currentUser) {

    const isAdmin = currentUser.role === 'admin'

    const filteredAdminIncidents = adminIncidents.filter((incident) => {
    const query = incidentSearch.trim().toLowerCase()
    const reporter = incident.reportedBy?.fullName || incident.reportedBy?.email || (typeof incident.reportedBy === 'string' ? incident.reportedBy : '')
    const searchable = [incident.title, incident.category, incident.location, incident.description, reporter, incident._id].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !query || searchable.includes(query)
    const matchesStatus = incidentStatusFilter === 'All' || (incident.status || 'Pending') === incidentStatusFilter
    const matchesCategory = incidentCategoryFilter === 'All' || incident.category === incidentCategoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const incidentCategories = [...new Set(adminIncidents.map((incident) => incident.category).filter(Boolean))]

  return (

      <div className="app">

        <header className="navbar">

          <a className="brand" href="#">

            <span className="brand-icon">S</span>

            SafeCampus

          </a>

          <div className="nav-actions">

            <span>Welcome, {currentUser.fullName || currentUser.email}</span>

            <button className="btn btn-outline" onClick={handleLogout}>

              Log out

            </button>

          </div>

        </header>

        <main>

          <section className="features-section">

            <div className="section-heading">

              <span className="eyebrow">YOUR SAFECAMPUS ACCOUNT</span>

              <h2>{isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}</h2>

              <p>

                Welcome back, {currentUser.fullName || currentUser.email}. You

                are logged in as {isAdmin ? 'an administrator' : 'a student'}.

              </p>

            </div>

            {isAdmin ? (

              <div className="feature-grid">

                <article className="feature-card">

                  <span className="feature-icon red">!</span>

                  <h3>Manage incidents</h3>

                  <p>Review reports submitted by students and update their status.</p>

                  <button type="button" className="btn btn-primary" onClick={handleFetchAdminIncidents}>

                    View all incidents

                  </button>

                </article>


                <article className="feature-card">
                  <span className="feature-icon amber">!</span>
                  <h3>Emergency management</h3>
                  <p>Review campus emergency alerts and update their response status.</p>
                  <button type="button" className="btn btn-primary" onClick={handleFetchAdminEmergencies}>
                    Manage emergency alerts
                  </button>
                  <button type="button" className="btn btn-outline notification-enable-button" onClick={enableBrowserNotifications}>
                    Enable browser notifications
                  </button>
                  {notificationMessage && <p className="notification-help" role="status">{notificationMessage}</p>}
                </article>

                <article className="feature-card">

                  <span className="feature-icon blue">✓</span>

                  <h3>Incident statistics</h3>

                  <p>View totals and status breakdown for campus safety reports.</p>

                  <button type="button" className="btn btn-primary" onClick={handleFetchAdminStats}>

                    View statistics

                  </button>

                </article>

              </div>

            ) : (

              <div className="feature-grid">

                <article className="feature-card">

                  <span className="feature-icon red">!</span>

                  <h3>Report an incident</h3>

                  <p>Submit a campus safety concern for review.</p>

                  <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                  setIncidentMessage('')
                  setShowIncidentForm(true)
                  }}
                  >
                  Report now
                  </button>

                </article>

                <article className="feature-card">

                  <span className="feature-icon blue">✓</span>

                  <h3>My reports</h3>

                  <p>Check the status of incidents you have submitted.</p>

                  <button type="button" className="btn btn-primary" onClick={handleFetchMyReports}>

                    View my reports

                  </button>

                </article>

                <article className="feature-card">

                  <span className="feature-icon amber">↗</span>

                  <h3>Emergency alerts</h3>

                  <p>Send an urgent alert and view your emergency alert history.</p>

                  <button type="button" className="sos-button" aria-label="Open emergency SOS alert form" onClick={() => {

                    setEmergencyMessage('')

                    setEmergencyConfirming(false)

                    setShowEmergencyPanel(true)

                  }}>

                    <span className="sos-button-label">SOS</span>

                    <span className="sos-button-caption">Send emergency alert</span>

                  </button>

                  <button type="button" className="btn btn-outline" onClick={handleFetchMyEmergencies}>

                    View my alerts

                  </button>

                </article>

              </div>

            )}

            {showAdminIncidents && isAdmin && (

              <section className="my-reports-section" aria-live="polite">

                <div className="section-heading">

                  <span className="eyebrow">ADMIN REVIEW</span>

                  <h2>Incident management</h2>

                  <button type="button" className="btn btn-outline" onClick={handleFetchAdminIncidents}>Refresh</button>

                  <button type="button" className="btn btn-outline" onClick={() => setShowAdminIncidents(false)}>

                    Hide incidents

                  </button>

                </div>

                {adminIncidentsLoading && <p>Loading incidents...</p>}

                {!adminIncidentsLoading && adminIncidentsMessage && <p role="status">{adminIncidentsMessage}</p>}

                {!adminIncidentsLoading && adminIncidents.length > 0 && (
                  <>
                    <div className="incident-toolbar">
                      <label className="incident-search">
                        <span>Search incidents</span>
                        <input value={incidentSearch} onChange={(event) => setIncidentSearch(event.target.value)} placeholder="Search title, location, reporter, ID..." />
                      </label>
                      <label>
                        <span>Filter by status</span>
                        <select value={incidentStatusFilter} onChange={(event) => setIncidentStatusFilter(event.target.value)}>
                          <option value="All">All statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </label>
                      <label>
                        <span>Filter by category</span>
                        <select value={incidentCategoryFilter} onChange={(event) => setIncidentCategoryFilter(event.target.value)}>
                          <option value="All">All categories</option>
                          {incidentCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </label>
                      <span className="incident-result-count">{filteredAdminIncidents.length} of {adminIncidents.length} incidents</span>
                    </div>
                    {filteredAdminIncidents.length === 0 ? <p role="status">No incidents match these search and filter settings.</p> : null}
                    <div className="feature-grid">

                    {filteredAdminIncidents.map((incident) => (

                      <article className="feature-card" key={incident._id}>

                        <span className="feature-icon red">!</span>

                        <h3>{incident.title}</h3>

                        <p><strong>Category:</strong> {incident.category}</p>

                        <p><strong>Location:</strong> {incident.location}</p>

                        <p><strong>Description:</strong> {incident.description}</p>

                        <p><strong>Current status:</strong> {incident.status || 'Pending'}</p>

                        <p><strong>Reported by:</strong> {incident.reportedBy?.fullName || incident.reportedBy?.email || (typeof incident.reportedBy === 'string' ? incident.reportedBy : 'Not provided')}</p>

                        <p><strong>Submitted:</strong> {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'Date unavailable'}</p>

                        <button type="button" className="btn btn-outline incident-details-button" onClick={() => setSelectedIncident(incident)}>View details & timeline</button>

                        <label htmlFor={`status-${incident._id}`}>Update status</label>

                        <select

                          id={`status-${incident._id}`}

                          value={incident.status || 'Pending'}

                          disabled={statusUpdatingId === incident._id}

                          onChange={(event) => handleUpdateIncidentStatus(incident._id, event.target.value)}

                        >

                          <option value="Pending">Pending</option>

                          <option value="Under Review">Under Review</option>

                          <option value="Resolved">Resolved</option>

                          <option value="Rejected">Rejected</option>

                        </select>

                        {statusUpdatingId === incident._id && <p>Updating status...</p>}

                      </article>

                    ))}

                    </div>
                  </>
                )}

                {selectedIncident && (
                  <div className="incident-modal-backdrop" role="presentation" onClick={() => setSelectedIncident(null)}>
                    <section className="incident-detail-modal" role="dialog" aria-modal="true" aria-labelledby="incident-detail-title" onClick={(event) => event.stopPropagation()}>
                      <button type="button" className="btn btn-outline incident-modal-close" onClick={() => setSelectedIncident(null)} aria-label="Close incident details">Close</button>
                      <span className="eyebrow">INCIDENT RECORD</span>
                      <h2 id="incident-detail-title">{selectedIncident.title || 'Incident details'}</h2>
                      <p><strong>Incident ID:</strong> {selectedIncident._id}</p>
                      <p><strong>Category:</strong> {selectedIncident.category || 'Not specified'}</p>
                      <p><strong>Location:</strong> {selectedIncident.location || 'Not specified'}</p>
                      <p><strong>Description:</strong> {selectedIncident.description || 'No description provided.'}</p>
                      <p><strong>Reported by:</strong> {selectedIncident.reportedBy?.fullName || selectedIncident.reportedBy?.email || (typeof selectedIncident.reportedBy === 'string' ? selectedIncident.reportedBy : 'Not provided')}</p>
                      <div className="incident-timeline">
                        <h3>Status timeline</h3>
                        <div className="timeline-entry"><span className="timeline-marker" /><div><strong>Report submitted</strong><p>{selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : 'Submission time unavailable'}</p></div></div>
                        <div className="timeline-entry"><span className="timeline-marker" /><div><strong>Current status: {selectedIncident.status || 'Pending'}</strong><p>{selectedIncident.updatedAt ? `Last updated ${new Date(selectedIncident.updatedAt).toLocaleString()}` : 'A detailed status-change history is not available from the current API.'}</p></div></div>
                      </div>
                      <p className="incident-timeline-note">This timeline uses timestamps currently returned by the API. A complete audit trail of every status change would require storing status history in the backend.</p>
                    </section>
                  </div>
                )}
              </section>

            )}

            {showAdminStats && isAdmin && (

              <section className="my-reports-section" aria-live="polite">

                <div className="section-heading">

                  <span className="eyebrow">CAMPUS SAFETY OVERVIEW</span>

                  <h2>Incident statistics</h2>

                  <button type="button" className="btn btn-outline" onClick={() => setShowAdminStats(false)}>

                    Hide statistics

                  </button>

                </div>

                {adminStatsLoading && <p>Loading statistics...</p>}

                {!adminStatsLoading && adminStatsMessage && <p role="status">{adminStatsMessage}</p>}

                {!adminStatsLoading && adminStats && (

                  <div className="feature-grid">

                    {Object.entries(adminStats).map(([key, value]) => (

                      <article className="feature-card" key={key}>

                        <span className="feature-icon blue">✓</span>

                        <h3>{key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ')}</h3>

                        <p>{typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}</p>

                      </article>

                    ))}

                  </div>

                )}

              </section>

            )}


            {showAdminEmergencies && isAdmin && (
              <section className="my-reports-section" aria-live="polite">
                <div className="section-heading">
                  <span className="eyebrow">CAMPUS SAFETY RESPONSE</span>
                  <h2>Emergency alerts</h2>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAdminEmergencies(false)}>
                    Hide alerts
                  </button>
                </div>

                {adminEmergenciesLoading && <p>Loading emergency alerts...</p>}
                {!adminEmergenciesLoading && adminEmergenciesMessage && (
                  <p role="status">{adminEmergenciesMessage}</p>
                )}

                {!adminEmergenciesLoading && adminEmergencies.length > 0 && (
                  <div className="feature-grid">
                    {adminEmergencies.map((emergency) => (
                      <article className="feature-card" key={emergency._id}>
                        <span className="feature-icon amber">!</span>
                        <h3>{emergency.message || 'Emergency assistance requested'}</h3>
                        <p><strong>Student:</strong> {emergency.triggeredBy?.fullName || 'Unknown student'}</p>
                        <p><strong>Email:</strong> {emergency.triggeredBy?.email || 'Not provided'}</p>
                        <p><strong>Student ID:</strong> {emergency.triggeredBy?.studentId || 'Not provided'}</p>
                        <p><strong>Location:</strong> {emergency.location || 'Not provided'}</p>
                        <p><strong>Status:</strong> {emergency.status || 'Active'}</p>
                        <p><strong>Submitted:</strong> {emergency.createdAt ? new Date(emergency.createdAt).toLocaleString() : 'Date unavailable'}</p>
                        <label htmlFor={`emergency-status-${emergency._id}`}>Update status</label>
                        <select
                          id={`emergency-status-${emergency._id}`}
                          value={emergency.status || 'Active'}
                          disabled={emergencyUpdatingId === emergency._id}
                          onChange={(event) => handleUpdateEmergencyStatus(emergency._id, event.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Acknowledged">Acknowledged</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        {emergencyUpdatingId === emergency._id && <p>Updating status...</p>}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showMyReports && !isAdmin && (

              <section className="my-reports-section" aria-live="polite">

                <div className="section-heading">

                  <span className="eyebrow">YOUR SUBMISSIONS</span>

                  <h2>My reports</h2>

                  <button type="button" className="btn btn-outline" onClick={() => setShowMyReports(false)}>

                    Hide reports

                  </button>

                </div>

                {reportsLoading && <p>Loading your reports...</p>}

                {!reportsLoading && reportsMessage && <p role="status">{reportsMessage}</p>}

                {!reportsLoading && myReports.length > 0 && (

                  <div className="feature-grid">

                    {myReports.map((report) => (

                      <article className="feature-card" key={report._id || `${report.title}-${report.createdAt}`}>

                        <span className="feature-icon blue">✓</span>

                        <h3>{report.title}</h3>

                        <p><strong>Category:</strong> {report.category}</p>

                        <p><strong>Location:</strong> {report.location}</p>

                        <p><strong>Description:</strong> {report.description}</p>

                        <p><strong>Status:</strong> {report.status || 'Pending'}</p>

                        <p><strong>Submitted:</strong> {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Date unavailable'}</p>

                      </article>

                    ))}

                  </div>

                )}

              </section>

            )}

            {showEmergencyPanel && !isAdmin && (

              <section className="my-reports-section" aria-live="polite">

                <div className="section-heading">

                  <span className="eyebrow">CAMPUS EMERGENCY</span>

                  <h2>Emergency alerts</h2>

                  <button type="button" className="btn btn-outline" onClick={() => setShowEmergencyPanel(false)}>

                    Hide emergency alerts

                  </button>

                </div>

                <form className="auth-modal" onSubmit={handleEmergencySubmit}>

                  <label htmlFor="emergency-message">Emergency message</label>

                  <textarea

                    id="emergency-message"

                    name="message"

                    placeholder="Describe the assistance you need"

                    rows={3}

                  />

                  <label htmlFor="emergency-location">Location</label>

                  <input
                    id="emergency-location"
                    name="location"
                    value={emergencyLocation}
                    onChange={(event) => setEmergencyLocation(event.target.value)}
                    placeholder="Building, block, or campus location"
                  />
                  <button type="button" className="btn btn-outline location-capture-button" onClick={captureEmergencyLocation}>
                    Use my current location
                  </button>
                  {locationMessage && <p className="location-help" role="status">{locationMessage}</p>}

                  <p role="note">Only send an alert for a genuine emergency. This feature does not replace contacting local emergency services.</p>

                  {emergencyMessage && <p role="status">{emergencyMessage}</p>}

                  {!emergencyConfirming ? (

                    <button className="sos-button sos-submit" type="button" onClick={() => setEmergencyConfirming(true)} disabled={emergencySubmitting}>

                      <span className="sos-button-label">SOS</span>

                      <span className="sos-button-caption">REVIEW &amp; SEND</span>

                    </button>

                  ) : (

                    <div className="emergency-confirm-panel" role="alert">

                      <span className="emergency-confirm-icon" aria-hidden="true">!</span>

                      <h3>Send emergency alert?</h3>

                      <p>This will notify the SafeCampus admin dashboard. Send only if you need assistance. It does not contact public emergency services.</p>

                      <div className="emergency-confirm-actions">

                        <button type="button" className="btn btn-outline" onClick={() => setEmergencyConfirming(false)} disabled={emergencySubmitting}>Cancel</button>

                        <button type="submit" className="btn btn-danger" disabled={emergencySubmitting}>{emergencySubmitting ? 'Sending alert…' : 'Yes, send SOS'}</button>

                      </div>

                    </div>

                  )}

                  <button type="button" className="btn btn-outline" onClick={handleFetchMyEmergencies} disabled={emergencyLoading}>

                    {emergencyLoading ? 'Refreshing...' : 'Refresh alert history'}

                  </button>

                </form>

                {emergencyLoading && <p>Loading emergency alerts...</p>}

                {!emergencyLoading && emergencies.length > 0 && (

                  <div className="feature-grid">

                    {emergencies.map((emergency) => (

                      <article className="feature-card" key={emergency._id}>

                        <span className="feature-icon amber">!</span>

                        <h3>{emergency.status || 'Active'}</h3>

                        <p><strong>Message:</strong> {emergency.message || 'Emergency assistance requested'}</p>

                        <p><strong>Location:</strong> {emergency.location || 'Location not provided'}</p>

                        <p><strong>Created:</strong> {emergency.createdAt ? new Date(emergency.createdAt).toLocaleString() : 'Date unavailable'}</p>

                      </article>

                    ))}

                  </div>

                )}

              </section>

            )}

            {showIncidentForm && (

              <div

                className="modal-backdrop"

                onClick={() => setShowIncidentForm(false)}

              >

                <section

                  className="auth-modal"

                  onClick={(event) => event.stopPropagation()}

                >

                  <button

                    type="button"

                    className="modal-close"

                    onClick={() => setShowIncidentForm(false)}

                    aria-label="Close incident form"

                  >

                    ×

                  </button>

                  <span className="eyebrow">CAMPUS SAFETY</span>

                  <h2>Report an incident</h2>

                  <p>

                    Provide accurate details so your report can be reviewed.

                  </p>

                  <form onSubmit={handleIncidentSubmit}>

                    <label htmlFor="incident-title">Incident title</label>

                    <input

                      id="incident-title"

                      name="title"

                      placeholder="Briefly describe the incident"

                      required

                    />

                    <label htmlFor="incident-category">Category</label>

                    <select

                      id="incident-category"

                      name="category"

                      required

                      defaultValue=""

                    >

                      <option value="" disabled>Select a category</option>

                      <option value="Harassment">Harassment</option>

                      <option value="Theft">Theft</option>

                      <option value="Medical Emergency">Medical Emergency</option>

                      <option value="Infrastructure">Infrastructure</option>

                      <option value="Suspicious Activity">Suspicious Activity</option>

                      <option value="Other">Other</option>

                    </select>

                    <label htmlFor="incident-location">Location</label>

                    <input

                      id="incident-location"

                      name="location"

                      placeholder="Building, block, or campus location"

                      required

                    />

                    <label htmlFor="incident-description">Description</label>

                    <textarea

                      id="incident-description"

                      name="description"

                      placeholder="Describe what happened"

                      rows={4}

                      required

                    />

                    {incidentMessage && (

                      <p role="status" aria-live="polite">{incidentMessage}</p>

                    )}

                    <button

                      className="btn btn-primary auth-submit"

                      type="submit"

                      disabled={incidentLoading}

                    >

                      {incidentLoading ? 'Submitting...' : 'Submit incident'}

                    </button>

                  </form>

                </section>

              </div>

            )}

          </section>

        </main>

        <footer className="footer">

          <a className="brand" href="#">

            <span className="brand-icon">S</span> SafeCampus

          </a>

          <p>Building safer campus communities, together.</p>

          <span>© {new Date().getFullYear()} SafeCampus</span>

        </footer>

      </div>

    )

  }

  // LANDING PAGE: shown when nobody is logged in

  return (

    <div className="app">

      <header className="navbar">

        <a
        className="brand"
        href="/"
        onClick={(e) => {
        e.preventDefault()
        navigate('/')
        }}
        >
        <span className="brand-icon">S</span>
        SafeCampus
        </a>

        <nav className="nav-links">
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How it works</a>
        </nav>

        <div className="nav-actions">
  <button
    type="button"
    className="btn btn-outline"
    onClick={() => navigate('/login')}
  >
    Log in
  </button>

  <button
    type="button"
    className="btn btn-primary"
    onClick={() => navigate('/register')}
  >
    Get Started
  </button>
</div>
      </header>

      <main>

        <section className="hero-section">

          <div className="hero-copy">

            <span className="eyebrow">CAMPUS SAFETY, REIMAGINED</span>

            <h1>A safer campus<br />starts with <span>you.</span></h1>

            <p>

              Report incidents, raise emergency alerts, and help make your

              campus a safer place for everyone.

            </p>

            <div className="hero-actions">

              <button

                className="btn btn-primary btn-large"

                onClick={() => navigate('/register')}

              >

                Join SafeCampus →

              </button>

              <a className="text-link" href="#how-it-works">Discover how it works</a>

            </div>

            <div className="trust-note">

              <span className="status-dot" />

              A community-driven approach to campus safety

            </div>

          </div>

          <div className="hero-visual">

            <div className="visual-glow" />

            <div className="safety-card">

              <div className="shield">✓</div>

              <span className="card-label">SAFETY DASHBOARD</span>

              <h2>Your campus.<br />Your safety.</h2>

              <div className="safety-row">

                <span className="mini-icon">!</span>

                <div>

                  <strong>Incident reporting</strong>

                  <small>Report concerns to campus authorities</small>

                </div>

              </div>

              <div className="safety-row">

                <span className="mini-icon green">✓</span>

                <div>

                  <strong>Stay informed</strong>

                  <small>Track updates on reported incidents</small>

                </div>

              </div>

              <div className="card-footer">

                <span className="status-dot" /> Designed for campus communities

              </div>

            </div>

            <div className="floating-tag">Safety starts together</div>

          </div>

        </section>

        <section className="features-section" id="features">

          <div className="section-heading">

            <span className="eyebrow">BUILT FOR YOUR CAMPUS</span>

            <h2>Safety tools that make a difference.</h2>

            <p>One place to report concerns and support a safer campus.</p>

          </div>

          <div className="feature-grid">

            <article className="feature-card">

              <span className="feature-icon red">!</span>

              <h3>Incident reporting</h3>

              <p>Submit campus safety concerns with the relevant details so they can be reviewed.</p>

            </article>

            <article className="feature-card">

              <span className="feature-icon amber">↗</span>

              <h3>Emergency alerts</h3>

              <p>Access the emergency alert feature when urgent attention is needed.</p>

            </article>

            <article className="feature-card">

              <span className="feature-icon blue">✓</span>

              <h3>Track your reports</h3>

              <p>Keep track of incidents you have submitted and their current status.</p>

            </article>

          </div>

        </section>

        <section className="how-section" id="how-it-works">

          <span className="eyebrow">SIMPLE BY DESIGN</span>

          <h2>Speak up. Stay informed.</h2>

          <div className="steps">

            <div><span>01</span><h3>Create an account</h3><p>Register using your student details.</p></div>

            <div><span>02</span><h3>Report a concern</h3><p>Provide the incident category, location, and description.</p></div>

            <div><span>03</span><h3>Follow progress</h3><p>Check updates as your report is reviewed.</p></div>

          </div>

        </section>

        {(showLogin || showRegister) && (

          <div className="modal-backdrop" onClick={closeAuthModal}>

            <section className="auth-modal" onClick={(event) => event.stopPropagation()}>

              <button type="button" className="modal-close" onClick={closeAuthModal} aria-label="Close authentication form">×</button>

              <span className="eyebrow">WELCOME TO SAFECAMPUS</span>

              <h2>{showLogin ? 'Welcome back' : 'Create your account'}</h2>

              <p>{showLogin ? 'Log in to access your campus safety dashboard.' : 'Join your campus safety community.'}</p>

              <form onSubmit={handleAuthSubmit}>

                {showRegister && (

                  <>

                    <label htmlFor="auth-full-name">Full name</label>

                    <input id="auth-full-name" name="fullName" placeholder="Enter your full name" autoComplete="name" required />

                    <label htmlFor="auth-student-id">Student ID</label>

                    <input id="auth-student-id" name="studentId" placeholder="Enter your student ID" required />

                  </>

                )}

                <label htmlFor="auth-email">Email address</label>

                <input id="auth-email" name="email" type="email" placeholder="you\@college.edu" autoComplete="email" required />

                <label htmlFor="auth-password">Password</label>

                <input id="auth-password" name="password" type="password" placeholder="Enter your password" autoComplete={showLogin ? 'current-password' : 'new-password'} required minLength={6} />

                <button className="btn btn-primary auth-submit" type="submit" disabled={authLoading}>

                  {authLoading ? 'Please wait...' : showLogin ? 'Log in' : 'Create account'}

                </button>

              </form>

              <p className="auth-switch">

                {showLogin ? 'New to SafeCampus?' : 'Already registered?'}

                <button onClick={() => navigate(showLogin ? '/register' : '/login')}>

                  {showLogin ? ' Create account' : ' Log in'}

                </button>

              </p>

            </section>

          </div>

        )}

      </main>

      <footer className="footer">

        <a className="brand" href="#"><span className="brand-icon">S</span> SafeCampus</a>

        <p>Building safer campus communities, together.</p>

        <span>© {new Date().getFullYear()} SafeCampus</span>

      </footer>

    </div>

  )

}

export default App
